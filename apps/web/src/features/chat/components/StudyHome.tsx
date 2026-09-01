import {
  describeNextExam,
  findNextExam,
  type SubjectSummary,
} from "@/lib/subjects/subject-summary";
import { HomeAskBox } from "./HomeAskBox";
import { HomeGreeting } from "./HomeGreeting";

type StudyHomeProps = {
  displayName: string;
  subjects: SubjectSummary[];
};

export function StudyHome({ displayName, subjects }: StudyHomeProps) {
  const nextExam = findNextExam(subjects);

  return (
    <div
      data-study-home
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center py-10"
    >
      <HomeGreeting displayName={displayName} />
      {nextExam ? (
        <p data-fades-on-ask className="mt-2 text-center text-base text-muted">
          {describeNextExam(nextExam)}
        </p>
      ) : null}
      <div className="mt-8 w-full">
        <HomeAskBox />
      </div>
    </div>
  );
}
