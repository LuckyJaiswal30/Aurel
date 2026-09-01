type RunningAnswer = { studentId: string; controller: AbortController };

const runningAnswers = new Map<string, RunningAnswer>();

export function startAnswer(requestId: string, studentId: string) {
  const controller = new AbortController();
  runningAnswers.set(requestId, { studentId, controller });
  return controller.signal;
}

export function finishAnswer(requestId: string) {
  runningAnswers.delete(requestId);
}

export function stopAnswer(requestId: string, studentId: string) {
  const running = runningAnswers.get(requestId);
  if (!running || running.studentId !== studentId) return false;
  running.controller.abort(new Error("Stopped by the student"));
  runningAnswers.delete(requestId);
  return true;
}
