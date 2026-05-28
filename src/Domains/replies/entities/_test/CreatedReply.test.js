import CreatedReply from '../CreatedReply.js';

describe('CreatedReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreatedReply({ id: 'reply-123', content: 'balasan' })).toThrowError('CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new CreatedReply({ id: 123, content: 'balasan', owner: 'user-123' })).toThrowError('CREATED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedReply object correctly', () => {
    const payload = { id: 'reply-123', content: 'sebuah balasan', owner: 'user-123' };
    const createdReply = new CreatedReply(payload);

    expect(createdReply.id).toEqual(payload.id);
    expect(createdReply.content).toEqual(payload.content);
    expect(createdReply.owner).toEqual(payload.owner);
  });
});
