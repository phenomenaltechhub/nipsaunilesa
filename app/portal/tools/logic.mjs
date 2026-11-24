/**
 * @typedef {{ id: string, grade: string, gradePoint: number, minimumPercent: number }} GradeBand
 * @typedef {{ id: string, code: string, creditUnits: number | string, grade: string }} Course
 * @typedef {{ id: string, name: string, courses: Course[] }} Semester
 * @typedef {{ id: string, title: string, course: string, day: string, startTime: string, endTime: string, type: "Lecture" | "Study", completed: boolean }} StudySession
 * @typedef {{ id: string, course: string, title: string, deadline: string, difficulty: number, confidence: number, estimatedMinutes: number }} StudyTopic
 * @typedef {{ version: 1, gradingScale: GradeBand[], semesters: Semester[], sessions: StudySession[], topics: StudyTopic[] }} StudyData
 */

export const STUDY_DATA_KEY = "nipsa-study-tools-v1";

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DEFAULT_GRADING_SCALE = [
  { id: "grade-a", grade: "A", gradePoint: 5, minimumPercent: 70 },
  { id: "grade-b", grade: "B", gradePoint: 4, minimumPercent: 60 },
  { id: "grade-c", grade: "C", gradePoint: 3, minimumPercent: 50 },
  { id: "grade-d", grade: "D", gradePoint: 2, minimumPercent: 45 },
  { id: "grade-e", grade: "E", gradePoint: 1, minimumPercent: 40 },
  { id: "grade-f", grade: "F", gradePoint: 0, minimumPercent: 0 },
];

/** @returns {StudyData} */
export function createDefaultStudyData() {
  return {
    version: 1,
    gradingScale: DEFAULT_GRADING_SCALE.map((band) => ({ ...band })),
    semesters: [{ id: "semester-1", name: "Semester 1", courses: [] }],
    sessions: [],
    topics: [],
  };
}

/**
 * @param {Course[]} courses
 * @param {GradeBand[]} gradingScale
 */
export function calculateCourses(courses, gradingScale) {
  if (!courses.length) throw new Error("Add at least one course before calculating.");

  const scale = validateGradingScale(gradingScale);
  let totalCredits = 0;
  let qualityPoints = 0;
  const results = courses.map((course, index) => {
    const name = course.code.trim();
    const units = Number(course.creditUnits);
    if (!name) throw new Error(`Enter a course name or code for course ${index + 1}.`);
    if (!Number.isFinite(units) || units <= 0) {
      throw new Error(`Enter positive credit units for ${name}.`);
    }

    const band = scale.find((item) => item.grade === course.grade);
    if (!band) throw new Error(`Choose a valid grade for ${name}.`);
    const courseQualityPoints = units * band.gradePoint;
    totalCredits += units;
    qualityPoints += courseQualityPoints;
    return { ...course, creditUnits: units, qualityPoints: courseQualityPoints };
  });

  if (!totalCredits) throw new Error("Total credit units must be greater than zero.");
  return {
    courses: results,
    totalCredits,
    qualityPoints,
    gpa: qualityPoints / totalCredits,
  };
}

/**
 * @param {Semester[]} semesters
 * @param {GradeBand[]} gradingScale
 */
export function calculateCumulative(semesters, gradingScale) {
  const courses = semesters.flatMap((semester) => semester.courses);
  return calculateCourses(courses, gradingScale);
}

/**
 * @param {StudySession[]} sessions
 * @param {Pick<StudySession, "day" | "startTime" | "endTime">} candidate
 * @param {string} [ignoreId]
 */
export function findSessionOverlap(sessions, candidate, ignoreId = "") {
  const start = timeToMinutes(candidate.startTime);
  const end = timeToMinutes(candidate.endTime);
  if (end <= start) throw new Error("End time must be later than start time.");

  return sessions.find((session) => {
    if (session.id === ignoreId || session.day !== candidate.day) return false;
    const existingStart = timeToMinutes(session.startTime);
    const existingEnd = timeToMinutes(session.endTime);
    return start < existingEnd && existingStart < end;
  });
}

/**
 * @param {StudyTopic[]} topics
 * @param {number} availableMinutes
 * @param {StudySession[]} sessions
 * @param {Date} [now]
 */
export function recommendStudyPlan(topics, availableMinutes, sessions, now = new Date()) {
  if (!Number.isInteger(availableMinutes) || availableMinutes < 10 || availableMinutes > 720) {
    throw new Error("Available study time must be between 10 and 720 whole minutes.");
  }
  if (!topics.length) throw new Error("Add at least one course topic before creating a plan.");

  const today = WEEKDAYS[(now.getDay() + 6) % 7];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const ranked = topics.map((topic, index) => {
    let score = topic.difficulty * 2 + (6 - topic.confidence) * 3;
    const reasons = [];

    if (topic.deadline) {
      const deadline = new Date(`${topic.deadline}T00:00:00.000Z`);
      if (Number.isNaN(deadline.getTime())) throw new Error(`Enter a valid deadline for ${topic.title}.`);
      const todayDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const daysUntilDeadline = Math.ceil((deadline.getTime() - todayDate.getTime()) / 86400000);
      if (daysUntilDeadline < 0) {
        score += 12;
        reasons.push("its deadline has passed");
      } else if (daysUntilDeadline === 0) {
        score += 10;
        reasons.push("its deadline is today");
      } else if (daysUntilDeadline <= 3) {
        score += 7;
        reasons.push("its deadline is within three days");
      } else if (daysUntilDeadline <= 7) {
        score += 3;
        reasons.push("its deadline is this week");
      }
    }

    const scheduledToday = sessions.some((session) =>
      session.type === "Study"
      && !session.completed
      && session.day === today
      && session.course.trim().toLowerCase() === topic.course.trim().toLowerCase()
      && timeToMinutes(session.endTime) > currentMinutes,
    );
    if (scheduledToday) {
      score += 4;
      reasons.push("you have a study session for this course today");
    }
    if (topic.confidence <= 2) reasons.push("your confidence is low");
    if (topic.difficulty >= 4) reasons.push("you marked it as challenging");

    return {
      ...topic,
      score,
      order: index,
      reason: reasons.length ? `Prioritised because ${reasons.join(" and ")}.` : "A steady revision choice based on your ratings.",
    };
  }).sort((a, b) => b.score - a.score || a.order - b.order);

  let remaining = availableMinutes;
  const plan = [];
  for (const topic of ranked) {
    if (remaining < 10) break;
    const minutes = Math.min(Number(topic.estimatedMinutes), remaining);
    if (!Number.isInteger(minutes) || minutes < 10) continue;
    plan.push({ ...topic, minutes });
    remaining -= minutes;
  }
  return { plan, unallocatedMinutes: remaining };
}

/**
 * @param {unknown} value
 * @returns {StudyData}
 */
export function validateStudyData(value) {
  if (!isRecord(value) || value.version !== 1) throw new Error("This study-data file has an unsupported format.");
  validateGradingScale(value.gradingScale);
  if (!Array.isArray(value.semesters) || value.semesters.length < 1 || value.semesters.length > 24
    || !value.semesters.every(isSemester)) {
    throw new Error("Study data contains an invalid semester or course.");
  }
  if (!Array.isArray(value.sessions) || value.sessions.length > 500 || !value.sessions.every(isStudySession)) {
    throw new Error("Study data contains an invalid timetable session.");
  }
  if (!Array.isArray(value.topics) || value.topics.length > 500 || !value.topics.every(isStudyTopic)) {
    throw new Error("Study data contains an invalid study-planning topic.");
  }
  const ids = [
    ...value.gradingScale.map((item) => item.id),
    ...value.semesters.flatMap((semester) => [semester.id, ...semester.courses.map((course) => course.id)]),
    ...value.sessions.map((session) => session.id),
    ...value.topics.map((topic) => topic.id),
  ];
  if (ids.some((id) => !id.trim() || id.length > 120) || new Set(ids).size !== ids.length) {
    throw new Error("Study data contains empty or duplicate record identifiers.");
  }
  value.sessions.forEach((session, index) => {
    const overlap = findSessionOverlap(value.sessions.slice(0, index), session);
    if (overlap) throw new Error(`The timetable contains overlapping sessions: ${overlap.title} and ${session.title}.`);
  });
  return /** @type {StudyData} */ (value);
}

/**
 * @param {string} text
 * @returns {StudyData}
 */
export function parseStudyData(text) {
  if (text.length > 2_000_000) throw new Error("Study-data files must be smaller than 2 MB.");
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }
  return validateStudyData(value);
}

/**
 * @param {{getItem(key: string): string | null}} storage
 */
export function loadStudyData(storage) {
  const value = storage.getItem(STUDY_DATA_KEY);
  return value === null ? createDefaultStudyData() : parseStudyData(value);
}

/**
 * @param {{setItem(key: string, value: string): void}} storage
 * @param {StudyData} value
 */
export function saveStudyData(storage, value) {
  storage.setItem(STUDY_DATA_KEY, JSON.stringify(validateStudyData(value)));
}

function validateGradingScale(value) {
  if (!Array.isArray(value) || value.length < 2 || value.length > 30) {
    throw new Error("Add at least two grade bands to the grading scale.");
  }
  const seenGrades = new Set();
  const seenIds = new Set();
  let previousMinimum = 101;
  for (const band of value) {
    if (!isRecord(band)
      || typeof band.id !== "string"
      || !band.id.trim()
      || band.id.length > 120
      || typeof band.grade !== "string"
      || !band.grade.trim()
      || band.grade.length > 8
      || typeof band.gradePoint !== "number"
      || !Number.isFinite(band.gradePoint)
      || band.gradePoint < 0
      || band.gradePoint > 10
      || typeof band.minimumPercent !== "number"
      || !Number.isFinite(band.minimumPercent)
      || band.minimumPercent < 0
      || band.minimumPercent > 100) {
      throw new Error("Each grade band needs a name, 0–10 grade point, and 0–100 minimum percentage.");
    }
    const grade = band.grade.trim().toUpperCase();
    if (seenGrades.has(grade)) throw new Error(`The grade ${grade} appears more than once.`);
    if (seenIds.has(band.id)) throw new Error("Grade-band identifiers must be unique.");
    if (band.minimumPercent >= previousMinimum) {
      throw new Error("Grade boundaries must be listed from highest to lowest.");
    }
    seenGrades.add(grade);
    seenIds.add(band.id);
    previousMinimum = band.minimumPercent;
  }
  return value;
}

function isSemester(value) {
  return isRecord(value)
    && typeof value.id === "string"
    && value.id.trim().length > 0
    && value.id.length <= 120
    && typeof value.name === "string"
    && value.name.trim().length > 0
    && value.name.length <= 60
    && Array.isArray(value.courses)
    && value.courses.length <= 200
    && value.courses.every((course) => isRecord(course)
      && typeof course.id === "string"
      && course.id.trim().length > 0
      && course.id.length <= 120
      && typeof course.code === "string"
      && course.code.length <= 80
      && (typeof course.creditUnits === "number" || typeof course.creditUnits === "string")
      && typeof course.grade === "string"
      && course.grade.length <= 8);
}

function isStudySession(value) {
  return isRecord(value)
    && typeof value.id === "string"
    && value.id.trim().length > 0
    && value.id.length <= 120
    && typeof value.title === "string"
    && value.title.trim().length > 0
    && value.title.length <= 80
    && typeof value.course === "string"
    && value.course.trim().length > 0
    && value.course.length <= 80
    && WEEKDAYS.includes(value.day)
    && isValidTime(value.startTime)
    && isValidTime(value.endTime)
    && value.endTime > value.startTime
    && (value.type === "Lecture" || value.type === "Study")
    && typeof value.completed === "boolean";
}

function isStudyTopic(value) {
  return isRecord(value)
    && typeof value.id === "string"
    && value.id.trim().length > 0
    && value.id.length <= 120
    && typeof value.course === "string"
    && value.course.trim().length > 0
    && value.course.length <= 80
    && typeof value.title === "string"
    && value.title.trim().length > 0
    && value.title.length <= 100
    && typeof value.deadline === "string"
    && isValidDate(value.deadline)
    && Number.isInteger(value.difficulty)
    && value.difficulty >= 1
    && value.difficulty <= 5
    && Number.isInteger(value.confidence)
    && value.confidence >= 1
    && value.confidence <= 5
    && Number.isInteger(value.estimatedMinutes)
    && value.estimatedMinutes >= 10
    && value.estimatedMinutes <= 720;
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isValidDate(value) {
  if (value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function timeToMinutes(value) {
  if (!isValidTime(value)) throw new Error("Choose a valid session time.");
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
