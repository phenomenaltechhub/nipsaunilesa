# M9 actual application review

These are actual Chromium screenshots and a recorded walkthrough of the current implementation using clearly labelled synthetic isolated fixtures. They are not design mockups, real university records or proof of production integration. Current identity, public website and production deployment are preserved.

| Review | Actual image |
| --- | --- |
| Enabled Community on phone | [390px](screenshots/390-community-enabled-final.png) |
| Enabled Community on desktop | [1440px](screenshots/1440-community-light.png) |
| Small/dark Community | [320px](screenshots/320-community-dark.png) |
| Restricted Community, history retained | [390px](screenshots/390-community-restricted.png) |
| Course schedule and study aids | [Schedule](screenshots/390-course-schedule.png), [Revision](screenshots/390-study-aids.png) |
| Saved account plan | [Phone](screenshots/390-planner.png), [Desktop](screenshots/1440-planner.png) |
| Representative schedule tools | [390px](screenshots/390-representative-schedule.png) |
| Claimed support role | [390px](screenshots/390-assigned-support-role.png) |
| Administrative hand-over | [1440px](screenshots/1440-support-handover.png) |
| Eligible activation-batch picker | [1440px](screenshots/1440-activation-batches.png) |
| Updated account guidance | [390px](screenshots/390-updated-help.png) |

Full-page images include fixed navigation at the browser viewport's position; actual scrolling and controls were separately exercised. Community images show the actual viewport layout. Enter inserts a newline and only the send arrow sends. Final synthetic Community is enabled; default database policy is still closed.

[Actual mobile walkthrough — MP4](media/m9-walkthrough.mp4) · [Captions](media/m9-walkthrough.vtt) · [Written transcript](media/m9-transcript.txt). No autoplay or credentials. The existing in-app tutorial is preserved; a final full-platform tutorial remains a pre-launch acceptance task.

[Milestone report](../../docs/nipsa-platform/m9/MILESTONE_9.md), [validation](evidence/validation-results.json), [performance comparison](evidence/performance-comparison.json), [after-only input profile](evidence/after-input-profile.json), [source hashes](evidence/preservation.json), [contrast follow-up](evidence/contrast-followup.json).

No physical Android, installed-device PWA or TalkBack claim: those gates remain not run. Automated scans report no violations but retain two incomplete contrast items; actual rendered pairs pass calculation, while small-label/device review is still required. Live feed and PR API access are blocked; source branch Git publication is separately reported in the final delivery receipt.
