import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_GRADING_SCALE,
  STUDY_DATA_KEY,
  calculateCourses,
  calculateCumulative,
  createDefaultStudyData,
  findSessionOverlap,
  loadStudyData,
  parseStudyData,
  recommendStudyPlan,
  saveStudyData,
  validateStudyData,
} from "../app/portal/tools/logic.mjs";

test("calculates weighted GPA from credit units and grade points", () => {
  const result = calculateCourses([
    { id: "c1", code: "PHM101", creditUnits: 4, grade: "A" },
    { id: "c2", code: "BIO101", creditUnits: 3, grade: "B" },
  ], DEFAULT_GRADING_SCALE);

  assert.equal(result.totalCredits, 7);
  assert.equal(result.qualityPoints, 32);
  assert.equal(result.gpa, 32 / 7);
});

test("rejects empty course lists, zero credit units, and unknown grades", () => {
  assert.throws(() => calculateCourses([], DEFAULT_GRADING_SCALE), /at least one course/i);
  assert.throws(() => calculateCourses([
    { id: "c1", code: "PHM101", creditUnits: 0, grade: "A" },
  ], DEFAULT_GRADING_SCALE), /positive credit units/i);
  assert.throws(() => calculateCourses([
    { id: "c1", code: "PHM101", creditUnits: 3, grade: "Z" },
  ], DEFAULT_GRADING_SCALE), /valid grade/i);
});

test("calculates cumulative GPA across semesters by total quality points", () => {
  const result = calculateCumulative([
    {
      id: "s1",
      name: "Semester 1",
      courses: [{ id: "c1", code: "PHM101", creditUnits: 4, grade: "A" }],
    },
    {
      id: "s2",
      name: "Semester 2",
      courses: [{ id: "c2", code: "PHM201", creditUnits: 2, grade: "C" }],
    },
  ], DEFAULT_GRADING_SCALE);

  assert.equal(result.totalCredits, 6);
  assert.equal(result.qualityPoints, 26);
  assert.equal(result.gpa, 26 / 6);
});

test("requires unique grade labels and descending grade boundaries", () => {
  assert.throws(() => validateStudyData({
    ...createDefaultStudyData(),
    gradingScale: [
      { id: "a", grade: "A", gradePoint: 5, minimumPercent: 70 },
      { id: "b", grade: "A", gradePoint: 4, minimumPercent: 60 },
    ],
  }), /appears more than once/i);
  assert.throws(() => validateStudyData({
    ...createDefaultStudyData(),
    gradingScale: [
      { id: "a", grade: "A", gradePoint: 5, minimumPercent: 50 },
      { id: "b", grade: "B", gradePoint: 4, minimumPercent: 60 },
    ],
  }), /highest to lowest/i);
});

test("detects overlapping sessions but permits adjacent sessions", () => {
  const existing = [{
    id: "s1",
    title: "Revision",
    course: "PHM101",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    type: "Study",
    completed: false,
  }];
  assert.equal(findSessionOverlap(existing, {
    day: "Monday",
    startTime: "09:30",
    endTime: "10:30",
  })?.id, "s1");
  assert.equal(findSessionOverlap(existing, {
    day: "Monday",
    startTime: "10:00",
    endTime: "10:30",
  }), undefined);
  assert.throws(() => findSessionOverlap(existing, {
    day: "Monday",
    startTime: "10:00",
    endTime: "09:00",
  }), /later than start time/i);
});

test("prioritises deadlines and low confidence within the available study time", () => {
  const now = new Date(2026, 10, 24, 8, 0);
  const topics = [
    { id: "t1", course: "PHM101", title: "Receptors", deadline: "2026-11-24", difficulty: 4, confidence: 1, estimatedMinutes: 30 },
    { id: "t2", course: "BIO101", title: "Cell structure", deadline: "", difficulty: 1, confidence: 5, estimatedMinutes: 30 },
  ];
  const sessions = [{
    id: "s1",
    title: "Study receptors",
    course: "PHM101",
    day: "Tuesday",
    startTime: "10:00",
    endTime: "11:00",
    type: "Study",
    completed: false,
  }];
  const result = recommendStudyPlan(topics, 45, sessions, now);

  assert.equal(result.plan[0].title, "Receptors");
  assert.match(result.plan[0].reason, /deadline is today/);
  assert.match(result.plan[0].reason, /study session for this course today/);
  assert.deepEqual(result.plan.map(({ minutes }) => minutes), [30, 15]);
  assert.equal(result.unallocatedMinutes, 0);
});

test("validates imports and reports browser-storage failures to callers", () => {
  const initial = createDefaultStudyData();
  const parsed = parseStudyData(JSON.stringify(initial));
  assert.deepEqual(parsed, initial);
  assert.throws(() => parseStudyData("{broken"), /not valid JSON/i);
  assert.throws(() => validateStudyData({ version: 1 }), /grading scale/i);

  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  saveStudyData(storage, initial);
  assert.equal(values.has(STUDY_DATA_KEY), true);
  assert.deepEqual(loadStudyData(storage), initial);
  assert.throws(() => saveStudyData({
    setItem() { throw new Error("Quota exceeded"); },
  }, initial), /Quota exceeded/);
});

test("rejects oversized, invalid-date, and overlapping imported data", () => {
  assert.throws(() => parseStudyData(" ".repeat(2_000_001)), /smaller than 2 MB/i);

  const withInvalidDeadline = createDefaultStudyData();
  withInvalidDeadline.topics = [{
    id: "topic-1",
    course: "PHM 101",
    title: "Receptors",
    deadline: "2026-02-30",
    difficulty: 3,
    confidence: 3,
    estimatedMinutes: 30,
  }];
  assert.throws(() => validateStudyData(withInvalidDeadline), /study-planning topic/i);

  const withOverlappingSessions = createDefaultStudyData();
  withOverlappingSessions.sessions = [
    { id: "session-1", title: "Lecture", course: "PHM 101", day: "Monday", startTime: "09:00", endTime: "10:00", type: "Lecture", completed: false },
    { id: "session-2", title: "Revision", course: "PHM 101", day: "Monday", startTime: "09:30", endTime: "10:30", type: "Study", completed: false },
  ];
  assert.throws(() => validateStudyData(withOverlappingSessions), /overlapping sessions/i);
});
