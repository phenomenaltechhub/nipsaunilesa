"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  WEEKDAYS,
  calculateCourses,
  calculateCumulative,
  createDefaultStudyData,
  findSessionOverlap,
  loadStudyData,
  parseStudyData,
  recommendStudyPlan,
  saveStudyData,
} from "./logic.mjs";

type GradeBand = { id: string; grade: string; gradePoint: number; minimumPercent: number };
type Course = { id: string; code: string; creditUnits: number | string; grade: string };
type Semester = { id: string; name: string; courses: Course[] };
type StudySession = {
  id: string;
  title: string;
  course: string;
  day: string;
  startTime: string;
  endTime: string;
  type: "Lecture" | "Study";
  completed: boolean;
};
type StudyTopic = {
  id: string;
  course: string;
  title: string;
  deadline: string;
  difficulty: number;
  confidence: number;
  estimatedMinutes: number;
};
type StudyData = {
  version: 1;
  gradingScale: GradeBand[];
  semesters: Semester[];
  sessions: StudySession[];
  topics: StudyTopic[];
};
type PlanItem = StudyTopic & { score: number; order: number; reason: string; minutes: number };
type SessionDraft = Omit<StudySession, "id" | "completed">;
type TopicDraft = Omit<StudyTopic, "id">;

const emptySession: SessionDraft = {
  title: "",
  course: "",
  day: "Monday",
  startTime: "09:00",
  endTime: "10:00",
  type: "Study",
};
const emptyTopic: TopicDraft = {
  course: "",
  title: "",
  deadline: "",
  difficulty: 3,
  confidence: 3,
  estimatedMinutes: 30,
};
const formatNumber = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const displayNumber = (value: number) => formatNumber.format(value);

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function errorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function StudyTools() {
  const [data, setData] = useState<StudyData>(() => createDefaultStudyData());
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [storageNotice, setStorageNotice] = useState("");
  const [utilityMessage, setUtilityMessage] = useState("");
  const [activeSemesterId, setActiveSemesterId] = useState("");
  const [calculationMessage, setCalculationMessage] = useState("");
  const [timetableMessage, setTimetableMessage] = useState("");
  const [plannerMessage, setPlannerMessage] = useState("");
  const [sessionDraft, setSessionDraft] = useState<SessionDraft>(emptySession);
  const [editingSessionId, setEditingSessionId] = useState("");
  const [topicDraft, setTopicDraft] = useState<TopicDraft>(emptyTopic);
  const [editingTopicId, setEditingTopicId] = useState("");
  const [availableMinutes, setAvailableMinutes] = useState(60);
  const [plan, setPlan] = useState<PlanItem[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const loaded = loadStudyData(window.localStorage) as StudyData;
        setData(loaded);
        setActiveSemesterId(loaded.semesters[0]?.id ?? "");
        setStorageReady(true);
      } catch (error) {
        setStorageError(`Saved study data could not be loaded: ${errorText(error, "browser storage is unavailable.")}`);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const timer = window.setTimeout(() => {
      try {
        saveStudyData(window.localStorage, data);
        setStorageNotice((current) => current ? "" : current);
      } catch (error) {
        setStorageNotice(`Changes are not being saved on this device: ${errorText(error, "browser storage is unavailable.")}`);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data, storageReady]);

  const activeSemester = data.semesters.find((semester) => semester.id === activeSemesterId)
    ?? data.semesters[0];
  const semesterCalculation = useMemo(() => {
    if (!activeSemester?.courses.length) return { result: null, error: "" };
    try {
      return { result: calculateCourses(activeSemester.courses, data.gradingScale), error: "" };
    } catch (error) {
      return { result: null, error: errorText(error, "The semester GPA could not be calculated.") };
    }
  }, [activeSemester, data.gradingScale]);
  const cumulativeCalculation = useMemo(() => {
    if (!data.semesters.some((semester) => semester.courses.length)) return { result: null, error: "" };
    try {
      return { result: calculateCumulative(data.semesters, data.gradingScale), error: "" };
    } catch (error) {
      return { result: null, error: errorText(error, "The cumulative GPA could not be calculated.") };
    }
  }, [data.semesters, data.gradingScale]);
  const semesterResult = semesterCalculation.result;
  const cumulativeResult = cumulativeCalculation.result;

  function updateSemester(update: (semester: Semester) => Semester) {
    if (!activeSemester) return;
    setData((current) => ({
      ...current,
      semesters: current.semesters.map((semester) =>
        semester.id === activeSemester.id ? update(semester) : semester,
      ),
    }));
  }

  function addSemester() {
    const semester = { id: createId(), name: `Semester ${data.semesters.length + 1}`, courses: [] };
    setData((current) => ({ ...current, semesters: [...current.semesters, semester] }));
    setActiveSemesterId(semester.id);
    setCalculationMessage("");
  }

  function removeSemester() {
    if (!activeSemester || data.semesters.length < 2) return;
    if (!window.confirm(`Remove ${activeSemester.name} and its courses?`)) return;
    const semesters = data.semesters.filter((semester) => semester.id !== activeSemester.id);
    setData((current) => ({ ...current, semesters }));
    setActiveSemesterId(semesters[0]?.id ?? "");
    setCalculationMessage("");
  }

  function addCourse() {
    updateSemester((semester) => ({
      ...semester,
      courses: [
        ...semester.courses,
        { id: createId(), code: "", creditUnits: 1, grade: data.gradingScale[0]?.grade ?? "" },
      ],
    }));
    setCalculationMessage("");
  }

  function updateCourse(courseId: string, field: keyof Course, value: string) {
    updateSemester((semester) => ({
      ...semester,
      courses: semester.courses.map((course) =>
        course.id === courseId ? { ...course, [field]: value } : course,
      ),
    }));
    setCalculationMessage("");
  }

  function removeCourse(courseId: string) {
    updateSemester((semester) => ({
      ...semester,
      courses: semester.courses.filter((course) => course.id !== courseId),
    }));
    setCalculationMessage("");
  }

  function updateGradeBand(bandId: string, field: keyof GradeBand, value: string) {
    setData((current) => ({
      ...current,
      gradingScale: current.gradingScale.map((band) => band.id === bandId
        ? {
            ...band,
            [field]: field === "grade"
              ? value.toUpperCase()
              : Number(value),
          }
        : band),
    }));
    setCalculationMessage("");
  }

  function addGradeBand() {
    const nextMinimum = Math.max(0, (data.gradingScale.at(-1)?.minimumPercent ?? 0) - 5);
    setData((current) => ({
      ...current,
      gradingScale: [
        ...current.gradingScale,
        { id: createId(), grade: "", gradePoint: 0, minimumPercent: nextMinimum },
      ],
    }));
  }

  function removeGradeBand(bandId: string) {
    if (data.gradingScale.length <= 2) {
      setCalculationMessage("Keep at least two grade bands in your grading scale.");
      return;
    }
    setData((current) => ({
      ...current,
      gradingScale: current.gradingScale.filter((band) => band.id !== bandId),
    }));
  }

  function calculate() {
    try {
      if (!activeSemester) throw new Error("Add a semester before calculating.");
      const result = calculateCourses(activeSemester.courses, data.gradingScale);
      setCalculationMessage(`${activeSemester.name} GPA: ${displayNumber(result.gpa)} from ${displayNumber(result.totalCredits)} credit units.`);
    } catch (error) {
      setCalculationMessage(errorText(error, "The GPA could not be calculated."));
    }
  }

  function handleExport() {
    let url = "";
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "nipsa-study-tools-data.json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setUtilityMessage("Study data export started.");
    } catch (error) {
      if (url) URL.revokeObjectURL(url);
      setUtilityMessage(`Study data could not be exported: ${errorText(error, "browser download failed.")}`);
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error("Choose a study-data file smaller than 2 MB.");
      const imported = parseStudyData(await file.text()) as StudyData;
      setData(imported);
      setActiveSemesterId(imported.semesters[0]?.id ?? "");
      setPlan([]);
      setUtilityMessage("Study data loaded from the selected file. Browser save status is shown above.");
    } catch (error) {
      setUtilityMessage(`Study data could not be imported: ${errorText(error, "the selected file is invalid.")}`);
    }
  }

  function resetAll() {
    if (!window.confirm("Remove all saved GPA, timetable, and study-planning data from this device?")) return;
    try {
      window.localStorage.removeItem("nipsa-study-tools-v1");
      const fresh = createDefaultStudyData() as StudyData;
      setData(fresh);
      setActiveSemesterId(fresh.semesters[0]?.id ?? "");
      setSessionDraft(emptySession);
      setTopicDraft(emptyTopic);
      setPlan([]);
      setStorageError("");
      setStorageNotice("");
      setUtilityMessage("All study-tool data was reset on this device.");
    } catch (error) {
      setUtilityMessage(`Saved data could not be reset: ${errorText(error, "browser storage is unavailable.")}`);
    }
  }

  function clearStorageError() {
    if (!window.confirm("Clear the unreadable saved data and start with a blank study file?")) return;
    try {
      window.localStorage.removeItem("nipsa-study-tools-v1");
      const fresh = createDefaultStudyData() as StudyData;
      setData(fresh);
      setActiveSemesterId(fresh.semesters[0]?.id ?? "");
      setStorageError("");
      setStorageReady(true);
    } catch (error) {
      setStorageError(`Browser storage could not be cleared: ${errorText(error, "access was denied.")}`);
    }
  }

  function saveSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTimetableMessage("");
    if (!sessionDraft.title.trim() || !sessionDraft.course.trim()) {
      setTimetableMessage("Enter both a session title and course name or code.");
      return;
    }
    try {
      const overlap = findSessionOverlap(data.sessions, sessionDraft, editingSessionId);
      if (overlap) throw new Error(`This overlaps with ${overlap.title} (${overlap.startTime}–${overlap.endTime}).`);
      if (editingSessionId) {
        setData((current) => ({
          ...current,
          sessions: current.sessions.map((session) => session.id === editingSessionId
            ? { ...session, ...sessionDraft }
            : session),
        }));
        setTimetableMessage("Session updated.");
      } else {
        const newSession: StudySession = {
          ...sessionDraft,
          id: createId(),
          completed: false,
        };
        setData((current) => ({ ...current, sessions: [...current.sessions, newSession] }));
        setTimetableMessage("Session added to your weekly timetable.");
      }
      setSessionDraft(emptySession);
      setEditingSessionId("");
    } catch (error) {
      setTimetableMessage(errorText(error, "The session could not be saved."));
    }
  }

  function editSession(session: StudySession) {
    setEditingSessionId(session.id);
    setSessionDraft({
      title: session.title,
      course: session.course,
      day: session.day,
      startTime: session.startTime,
      endTime: session.endTime,
      type: session.type,
    });
    setTimetableMessage("");
  }

  function toggleSession(sessionId: string) {
    setData((current) => ({
      ...current,
      sessions: current.sessions.map((session) => session.id === sessionId
        ? { ...session, completed: !session.completed }
        : session),
    }));
  }

  function removeSession(sessionId: string) {
    setData((current) => ({
      ...current,
      sessions: current.sessions.filter((session) => session.id !== sessionId),
    }));
    if (editingSessionId === sessionId) {
      setEditingSessionId("");
      setSessionDraft(emptySession);
    }
  }

  function saveTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlannerMessage("");
    if (!topicDraft.course.trim() || !topicDraft.title.trim()) {
      setPlannerMessage("Enter both a course name or code and a topic.");
      return;
    }
    if (!Number.isInteger(topicDraft.difficulty) || topicDraft.difficulty < 1 || topicDraft.difficulty > 5
      || !Number.isInteger(topicDraft.confidence) || topicDraft.confidence < 1 || topicDraft.confidence > 5) {
      setPlannerMessage("Difficulty and confidence must each be between 1 and 5.");
      return;
    }
    if (!Number.isInteger(topicDraft.estimatedMinutes)
      || topicDraft.estimatedMinutes < 10
      || topicDraft.estimatedMinutes > 720) {
      setPlannerMessage("Estimated study time must be between 10 and 720 whole minutes.");
      return;
    }
    const topic: StudyTopic = { ...topicDraft, id: editingTopicId || createId() };
    setData((current) => ({
      ...current,
      topics: editingTopicId
        ? current.topics.map((item) => item.id === editingTopicId ? topic : item)
        : [...current.topics, topic],
    }));
    setTopicDraft(emptyTopic);
    setEditingTopicId("");
    setPlannerMessage(editingTopicId ? "Topic updated." : "Topic added.");
    setPlan([]);
  }

  function editTopic(topic: StudyTopic) {
    const { id, ...draft } = topic;
    setEditingTopicId(id);
    setTopicDraft(draft);
    setPlannerMessage("");
  }

  function removeTopic(topicId: string) {
    setData((current) => ({
      ...current,
      topics: current.topics.filter((topic) => topic.id !== topicId),
    }));
    setPlan((current) => current.filter((topic) => topic.id !== topicId));
    if (editingTopicId === topicId) {
      setEditingTopicId("");
      setTopicDraft(emptyTopic);
    }
  }

  function createPlan() {
    try {
      const result = recommendStudyPlan(data.topics, Number(availableMinutes), data.sessions);
      setPlan(result.plan as PlanItem[]);
      setPlannerMessage(result.plan.length
        ? `A ${displayNumber(Number(availableMinutes) - result.unallocatedMinutes)}-minute plan is ready. Adjust the time blocks to suit you.`
        : "No study block fits the available time. Increase your study time or shorten a topic estimate.");
    } catch (error) {
      setPlannerMessage(errorText(error, "A study plan could not be created."));
      setPlan([]);
    }
  }

  if (storageError) {
    return (
      <section className="study-tools-storage-error" role="alert">
        <h2>Saved study data needs attention</h2>
        <p>{storageError}</p>
        <button className="button secondary" type="button" onClick={clearStorageError}>Clear unreadable data and start fresh</button>
      </section>
    );
  }

  return (
    <div className="study-tools" aria-busy={!storageReady}>
      <nav className="study-tools-jump-links" aria-label="Study tool sections">
        <a href="#gpa-calculator">GPA and CGPA</a>
        <a href="#study-timetable">Weekly timetable</a>
        <a href="#study-planner">Daily study planner</a>
      </nav>
      {!storageReady && <p className="study-tools-loading" role="status">Loading your saved study tools…</p>}
      <fieldset className="study-tools-controls" disabled={!storageReady}>
        <legend className="sr-only">Study tool controls</legend>
        <div className="study-tools-data-actions" aria-label="Study data management">
        <p>Data is stored locally in this browser.</p>
        <div>
          <button type="button" className="text-button" onClick={handleExport}>Export data</button>
          <label className="text-button study-import-label">
            Import data
            <input type="file" accept=".json,application/json" onChange={handleImport} />
          </label>
          <button type="button" className="text-button" onClick={resetAll}>Reset all</button>
        </div>
      </div>
      {storageNotice && <p className="study-tools-alert" role="alert">{storageNotice}</p>}
      {utilityMessage && <p className="study-tools-message" role="status">{utilityMessage}</p>}

      <section className="study-tool-section" id="gpa-calculator" aria-labelledby="gpa-title">
        <div className="study-tool-heading">
          <p className="eyebrow">01 · Grade planning</p>
          <h2 id="gpa-title">GPA and CGPA calculator</h2>
          <p>Estimate weighted grade-point averages for your own planning. These calculations are not official University results.</p>
        </div>
        <p className="study-tools-notice">
          <strong>Sample grading scale, not a verified University of Ilesa policy.</strong>{" "}
          Confirm the grading rules that apply to you and adjust the grade points and minimum
          percentage boundaries below before relying on an estimate.
        </p>

        <details className="study-scale-settings">
          <summary>Review and edit grading scale</summary>
          <div className="study-scale-list">
            {data.gradingScale.map((band) => (
              <div className="study-scale-row" key={band.id}>
                <label>Grade<input aria-label={`Grade label ${band.grade || "new"}`} value={band.grade} maxLength={8} onChange={(event) => updateGradeBand(band.id, "grade", event.target.value)} /></label>
                <label>Grade points<input aria-label={`Grade points for ${band.grade || "new grade"}`} type="number" min="0" max="10" step="0.1" value={band.gradePoint} onChange={(event) => updateGradeBand(band.id, "gradePoint", event.target.value)} /></label>
                <label>Minimum percent<input aria-label={`Minimum percentage for ${band.grade || "new grade"}`} type="number" min="0" max="100" step="1" value={band.minimumPercent} onChange={(event) => updateGradeBand(band.id, "minimumPercent", event.target.value)} /></label>
                <button type="button" className="text-button" onClick={() => removeGradeBand(band.id)} aria-label={`Remove ${band.grade || "new"} grade band`}>Remove</button>
              </div>
            ))}
            <button type="button" className="button secondary" onClick={addGradeBand}>Add grade band</button>
            <p className="study-tools-help">Grade bands must have unique labels and descending minimum-percentage boundaries.</p>
          </div>
        </details>

        <div className="study-semester-bar">
          <label>Semester
            <select value={activeSemester?.id ?? ""} onChange={(event) => setActiveSemesterId(event.target.value)} aria-label="Select semester">
              {data.semesters.map((semester) => <option value={semester.id} key={semester.id}>{semester.name}</option>)}
            </select>
          </label>
          <button type="button" className="button secondary" onClick={addSemester}>Add semester</button>
          <button type="button" className="text-button" onClick={removeSemester} disabled={data.semesters.length < 2}>Remove semester</button>
        </div>
        {activeSemester && (
          <label className="study-semester-name">Semester name
            <input value={activeSemester.name} onChange={(event) => updateSemester((semester) => ({ ...semester, name: event.target.value }))} maxLength={60} />
          </label>
        )}
        {activeSemester && (
          <>
            <div className="study-course-list">
              <div className="study-course-header" aria-hidden="true"><span>Course name or code</span><span>Credit units</span><span>Grade</span><span>Quality points</span><span /></div>
              {activeSemester.courses.map((course) => {
                const band = data.gradingScale.find((item) => item.grade === course.grade);
                const units = Number(course.creditUnits);
                const qualityPoints = band && Number.isFinite(units) && units > 0 ? units * band.gradePoint : null;
                return (
                  <div className="study-course-row" key={course.id}>
                    <label><span>Course</span><input id={`course-code-${course.id}`} value={course.code} onChange={(event) => updateCourse(course.id, "code", event.target.value)} placeholder="e.g. PHM 201" maxLength={80} /></label>
                    <label><span>Credit units</span><input id={`course-units-${course.id}`} type="number" min="0.1" max="100" step="0.1" value={course.creditUnits} onChange={(event) => updateCourse(course.id, "creditUnits", event.target.value)} /></label>
                    <label><span>Grade</span><select id={`course-grade-${course.id}`} value={course.grade} onChange={(event) => updateCourse(course.id, "grade", event.target.value)}>
                      {!band && <option value={course.grade}>{course.grade || "Select grade"}</option>}
                      {data.gradingScale.map((item) => <option value={item.grade} key={item.id}>{item.grade}</option>)}
                    </select></label>
                    <output aria-label={`Quality points for ${course.code || "course"}`}><span>Quality points</span>{qualityPoints === null ? "—" : displayNumber(qualityPoints)}</output>
                    <button type="button" className="text-button" onClick={() => removeCourse(course.id)} aria-label={`Remove ${course.code || "course"}`}>Remove</button>
                  </div>
                );
              })}
              {!activeSemester.courses.length && <p className="study-tools-empty">Add your course records to calculate a semester GPA.</p>}
            </div>
            <div className="study-course-actions">
              <button type="button" className="button secondary" onClick={addCourse}>Add course</button>
              <button type="button" className="button primary" onClick={calculate}>Calculate GPA</button>
            </div>
          </>
        )}
        {calculationMessage && <p className="study-tools-message" role="status">{calculationMessage}</p>}
        {semesterCalculation.error && <p className="study-tools-help" role="status">{semesterCalculation.error}</p>}
        {cumulativeCalculation.error && <p className="study-tools-help" role="status">Cumulative GPA: {cumulativeCalculation.error}</p>}
        <div className="study-results" aria-live="polite">
          <article><span>{activeSemester?.name ?? "Semester"} GPA</span><strong>{semesterResult ? displayNumber(semesterResult.gpa) : "—"}</strong><small>{semesterResult ? `${displayNumber(semesterResult.totalCredits)} credit units · ${displayNumber(semesterResult.qualityPoints)} quality points` : "Add complete course records to calculate"}</small></article>
          <article><span>Cumulative GPA</span><strong>{cumulativeResult ? displayNumber(cumulativeResult.gpa) : "—"}</strong><small>{cumulativeResult ? `${displayNumber(cumulativeResult.totalCredits)} total units · ${displayNumber(cumulativeResult.qualityPoints)} quality points` : "Add course records across semesters"}</small></article>
        </div>
      </section>

      <section className="study-tool-section" id="study-timetable" aria-labelledby="timetable-title">
        <div className="study-tool-heading">
          <p className="eyebrow">02 · Weekly routine</p>
          <h2 id="timetable-title">Study timetable</h2>
          <p>Organise personal study sessions alongside lectures you choose to record. This is a private planner, not an official departmental timetable.</p>
        </div>
        <form className="study-entry-form" onSubmit={saveSession}>
          <label>Session title<input value={sessionDraft.title} onChange={(event) => setSessionDraft((current) => ({ ...current, title: event.target.value }))} maxLength={80} required placeholder="e.g. Revise lecture notes" /></label>
          <label>Course name or code<input value={sessionDraft.course} onChange={(event) => setSessionDraft((current) => ({ ...current, course: event.target.value }))} maxLength={80} required placeholder="e.g. PHM 201" /></label>
          <label>Day<select value={sessionDraft.day} onChange={(event) => setSessionDraft((current) => ({ ...current, day: event.target.value }))}>{WEEKDAYS.map((day) => <option key={day}>{day}</option>)}</select></label>
          <label>Type<select value={sessionDraft.type} onChange={(event) => setSessionDraft((current) => ({ ...current, type: event.target.value === "Lecture" ? "Lecture" : "Study" }))}><option>Study</option><option>Lecture</option></select></label>
          <label>Start time<input type="time" value={sessionDraft.startTime} onChange={(event) => setSessionDraft((current) => ({ ...current, startTime: event.target.value }))} required /></label>
          <label>End time<input type="time" value={sessionDraft.endTime} onChange={(event) => setSessionDraft((current) => ({ ...current, endTime: event.target.value }))} required /></label>
          <div className="study-entry-actions">
            <button type="submit" className="button primary">{editingSessionId ? "Save session" : "Add session"}</button>
            {editingSessionId && <button type="button" className="text-button" onClick={() => { setEditingSessionId(""); setSessionDraft(emptySession); }}>Cancel edit</button>}
          </div>
        </form>
        {timetableMessage && <p className="study-tools-message" role="status">{timetableMessage}</p>}
        <div className="study-week-grid">
          {WEEKDAYS.map((day) => {
            const sessions = data.sessions.filter((session) => session.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            return (
              <section className="study-day-column" key={day} aria-label={`${day} sessions`}>
                <h3>{day}</h3>
                {sessions.length ? sessions.map((session) => (
                  <article className={`study-session${session.completed ? " study-session--completed" : ""}`} key={session.id}>
                    <span className="study-session-time">{session.startTime}–{session.endTime}</span>
                    <strong>{session.title}</strong>
                    <span>{session.course} · {session.type}</span>
                    <div className="study-session-actions">
                      {session.type === "Study" && <label><input type="checkbox" checked={session.completed} onChange={() => toggleSession(session.id)} />Done</label>}
                      <button type="button" className="text-button" onClick={() => editSession(session)}>Edit</button>
                      <button type="button" className="text-button" onClick={() => removeSession(session.id)} aria-label={`Remove ${session.title}`}>Remove</button>
                    </div>
                  </article>
                )) : <p className="study-day-empty">No sessions</p>}
              </section>
            );
          })}
        </div>
      </section>

      <section className="study-tool-section" id="study-planner" aria-labelledby="planner-title">
        <div className="study-tool-heading">
          <p className="eyebrow">03 · Personal revision</p>
          <h2 id="planner-title">What should I study today?</h2>
          <p>A transparent rule-based suggestion using your deadlines, difficulty, confidence, available time, and upcoming sessions. It is a planning aid, not an AI or validated learning recommendation.</p>
        </div>
        <form className="study-entry-form study-topic-form" onSubmit={saveTopic}>
          <label>Course name or code<input value={topicDraft.course} onChange={(event) => setTopicDraft((current) => ({ ...current, course: event.target.value }))} maxLength={80} required placeholder="e.g. PHM 201" /></label>
          <label>Topic to study<input value={topicDraft.title} onChange={(event) => setTopicDraft((current) => ({ ...current, title: event.target.value }))} maxLength={100} required placeholder="e.g. Receptor pharmacology" /></label>
          <label>Deadline, if known<input type="date" value={topicDraft.deadline} onChange={(event) => setTopicDraft((current) => ({ ...current, deadline: event.target.value }))} /></label>
          <label>Difficulty
            <select value={topicDraft.difficulty} onChange={(event) => setTopicDraft((current) => ({ ...current, difficulty: Number(event.target.value) }))}>{[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value} · {value <= 2 ? "Lower" : value === 3 ? "Moderate" : "Higher"}</option>)}</select>
          </label>
          <label>Confidence
            <select value={topicDraft.confidence} onChange={(event) => setTopicDraft((current) => ({ ...current, confidence: Number(event.target.value) }))}>{[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value} · {value <= 2 ? "Low" : value === 3 ? "Medium" : "High"}</option>)}</select>
          </label>
          <label>Estimated study minutes<input type="number" min="10" max="720" step="5" value={topicDraft.estimatedMinutes} onChange={(event) => setTopicDraft((current) => ({ ...current, estimatedMinutes: Number(event.target.value) }))} /></label>
          <div className="study-entry-actions">
            <button type="submit" className="button secondary">{editingTopicId ? "Save topic" : "Add topic"}</button>
            {editingTopicId && <button type="button" className="text-button" onClick={() => { setEditingTopicId(""); setTopicDraft(emptyTopic); }}>Cancel edit</button>}
          </div>
        </form>
        {plannerMessage && <p className="study-tools-message" role="status">{plannerMessage}</p>}
        <div className="study-topic-list">
          {data.topics.map((topic) => (
            <div className="study-topic-row" key={topic.id}>
              <div><strong>{topic.title}</strong><span>{topic.course}{topic.deadline ? ` · Due ${topic.deadline}` : " · No deadline set"}</span><small>Difficulty {topic.difficulty}/5 · Confidence {topic.confidence}/5 · About {topic.estimatedMinutes} min</small></div>
              <button type="button" className="text-button" onClick={() => editTopic(topic)}>Edit</button>
              <button type="button" className="text-button" onClick={() => removeTopic(topic.id)} aria-label={`Remove ${topic.title}`}>Remove</button>
            </div>
          ))}
          {!data.topics.length && <p className="study-tools-empty">Add a course topic to receive a personal revision suggestion.</p>}
        </div>
        <div className="study-plan-controls">
          <label>Available study time in minutes<input type="number" min="10" max="720" step="5" value={availableMinutes} onChange={(event) => setAvailableMinutes(Number(event.target.value))} /></label>
          <button type="button" className="button primary" onClick={createPlan}>Suggest a study plan</button>
        </div>
        {plan.length > 0 && (
          <ol className="study-plan-list">
            {plan.map((item) => (
              <li key={item.id}>
                <div><strong>{item.title}</strong><span>{item.course} · {item.reason}</span></div>
                <label>Minutes<input type="number" min="10" max={availableMinutes} step="5" value={item.minutes} onChange={(event) => {
                  const minutes = Number(event.target.value);
                  if (Number.isInteger(minutes) && minutes >= 10 && minutes <= availableMinutes) {
                    setPlan((current) => current.map((entry) => entry.id === item.id ? { ...entry, minutes } : entry));
                  } else {
                    setPlannerMessage(`Choose a whole number between 10 and ${availableMinutes} minutes.`);
                  }
                }} /></label>
                <button type="button" className="text-button" onClick={() => setPlan((current) => current.filter((entry) => entry.id !== item.id))}>Remove from plan</button>
              </li>
            ))}
          </ol>
        )}
      </section>
      </fieldset>
    </div>
  );
}
