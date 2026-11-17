import { element,emptyState,link,pageHeading } from '../../components/dom.js';
import { academicNavigation,sectionHeading,tabs } from '../../components/academic.js';
import { resourceCategories } from './catalogue.js';
// Reviewed service content only; developer drafts use a separate renderer.
export function courseHubView(){const root=element('div');root.append(pageHeading('COURSES','No course selected','Choose a course to view its information, study materials and schedule.'),academicNavigation('courses'));const card=element('section','card');card.append(sectionHeading('Course workspace'));
 card.append(tabs('course-hub','Course hub sections',[
 {id:'details',title:'Course details',render:()=>emptyState('Course information','Select a course to see its details.')},
 {id:'topics',title:'Topics',render:()=>emptyState('No topics added','Topics and subtopics will appear here.')},
 {id:'materials',title:'Materials',render(){const body=element('div');const label=element('label','field-label','Course resource category');label.htmlFor='course-resource-category';const select=element('select');select.id=label.htmlFor;select.add(new Option('All categories','all'));for(const [key,title]of Object.entries(resourceCategories))select.add(new Option(title,key));body.append(label,select,emptyState('No study materials added','Lecture notes, slides and practical materials will appear here.'));return body;}},
 {id:'schedule',title:'Schedule',render:()=>emptyState('No timetable entries','Classes, assignments and deadlines will appear here.','timetable')},
 {id:'notices',title:'Announcements',render:()=>emptyState('No announcements','Course notices will appear here.','notifications')},
 {id:'syllabus',title:'Syllabus',render:()=>emptyState('No syllabus added','Approved syllabus information will appear here.')},
 {id:'revision',title:'Revision',render(){const body=element('div');body.append(emptyState('No revision materials added','Organise your study topics and revision priorities.','planner'),link('#/progress','Open personal course progress →','button subtle'),link('#/planner','Open the study planner →','back-link'));return body;}},
 ]));root.append(card,link('#/courses','← Back to courses','back-link'));return root;}
