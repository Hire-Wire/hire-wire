class LLMResponseProcessingService {
  constructor(content) {
    this.content = content;
  }

  call() {
    return this.#splitResumeAndCoverLetter();
  }

  #splitResumeAndCoverLetter() {
    // Find the index of the Cover Letter section
    const coverLetterStart = this.content.indexOf('##CoverLetter##');

    if (coverLetterStart === -1) {
      throw new Error('Could not find the start of the cover letter (##CoverLetter##).');
    }

    // Extract the resume content from the beginning to the start of the Cover Letter section
    const resume = this.content.substring(0, coverLetterStart)
      .trim() // Remove any extra spaces or newlines
      .replace(/^##Resume##\s*/, '')

    // Extract the cover letter, starting after the Cover Letter header
    const coverLetter = this.content.substring(coverLetterStart)
      .trim() // Remove any extra spaces or newlines
      .replace(/^##CoverLetter##\s*/, ''); // Remove the header

    return { resume, coverLetter };
  }
}

export default LLMResponseProcessingService;
