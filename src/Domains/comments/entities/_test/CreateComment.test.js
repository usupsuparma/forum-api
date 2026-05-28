import CreateComment from '../CreateComment.js';

describe('CreateComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreateComment({ content: 'komentar', threadId: 'thread-123' })).toThrowError('CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new CreateComment({ content: 123, threadId: 'thread-123', owner: 'user-123' })).toThrowError('CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateComment object correctly', () => {
    const payload = { content: 'sebuah komentar', threadId: 'thread-123', owner: 'user-123' };
    const createComment = new CreateComment(payload);

    expect(createComment.content).toEqual(payload.content);
    expect(createComment.threadId).toEqual(payload.threadId);
    expect(createComment.owner).toEqual(payload.owner);
  });
});
