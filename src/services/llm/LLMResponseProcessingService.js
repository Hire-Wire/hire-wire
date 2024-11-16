class LLMResponseProcessingService {
  constructor(content) {
    this.content = content;
  }

  async call() {
    const result = await this.splitResumeAndCoverLetter();
    return result;
  }

  splitResumeAndCoverLetter() {
    if (!this.content || typeof this.content !== 'string') {
      throw new Error('Invalid content. Expected a non-empty string.');
    }

    // Find the index of the Cover Letter section
    const coverLetterStart = this.content.indexOf('##CoverLetter##');

    if (coverLetterStart === -1) {
      throw new Error('Could not find the start of the cover letter (##CoverLetter##).');
    }

    const resume = this.content.slice(0, coverLetterStart)
      .trim()
      .replace(/^##Resume##\s*/, '');

    const coverLetter = this.content.slice(coverLetterStart)
      .trim()
      .replace(/^##CoverLetter##\s*/, '');

    if (!resume) {
      throw new Error('Extracted resume content is empty.');
    }

    if (!coverLetter) {
      throw new Error('Extracted cover letter content is empty.');
    }

    return { resume, coverLetter };
  }
}

export default LLMResponseProcessingService;
