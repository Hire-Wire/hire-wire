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

    // Extract the resume content from the beginning to the start of the Cover Letter section
    const resume = this.content.substring(0, coverLetterStart)
      .trim(); // Remove any extra spaces or newlines

    // Extract the cover letter, starting after the Cover Letter header
    const coverLetter = this.content.substring(coverLetterStart)
      .trim() // Remove any extra spaces or newlines
      .replace(/^# Cover Letter\s*/, ''); // Remove the header

    return { resume, coverLetter };
  }
}

export default LLMResponseProcessingService;
