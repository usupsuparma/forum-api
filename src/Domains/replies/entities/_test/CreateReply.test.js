import CreateReply from '../CreateReply.js';

describe('CreateReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreateReply({ content: 'balasan', commentId: 'comment-123' })).toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new CreateReply({ content: 123, commentId: 'comment-123', owner: 'user-123' })).toThrowError('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateReply object correctly', () => {
    const payload = { content: 'sebuah balasan', commentId: 'comment-123', owner: 'user-123' };
    const createReply = new CreateReply(payload);

    expect(createReply.content).toEqual(payload.content);
    expect(createReply.commentId).toEqual(payload.commentId);
    expect(createReply.owner).toEqual(payload.owner);
  });
});
