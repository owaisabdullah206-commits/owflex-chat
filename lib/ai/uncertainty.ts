export const UNCERTAINTY_RE =
  /\b(i don'?t know|i'?m not sure|i can'?t help|don'?t have (that |the )?information|outside my knowledge|beyond my (knowledge|training)|i'?m unable to|cannot (help|answer|provide)|no information (about|on)|i don'?t have access)\b/i

export function flagIfUnanswered(content: string): boolean {
  return UNCERTAINTY_RE.test(content)
}
