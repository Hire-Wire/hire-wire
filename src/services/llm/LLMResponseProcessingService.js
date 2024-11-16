class LLMResponseProcessingService {
  constructor(content) {
    this.content = content;
  }

  call() {
    return this.#splitResumeAndCoverLetter();
  }

  #splitResumeAndCoverLetter() {
    // Find the index of the Cover Letter section
    const coverLetterStart = this.content.indexOf('# Cover Letter');

    if (coverLetterStart === -1) {
      throw new Error('Could not find the start of the cover letter (# Cover Letter).');
    }

    // Extract the resume content
    const resume = this.content.substring(0, coverLetterStart)
      .trim();

    // Extract the cover letter content
    const coverLetter = this.content.substring(coverLetterStart)
      .trim()
      .replace(/^# Cover Letter\s*/, '');

    return { resume, coverLetter };
  }
}

export default LLMResponseProcessingService;
