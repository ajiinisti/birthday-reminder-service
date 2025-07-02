import { validateUserInput, validateUserUpdate } from '../../src/validators/user.validator.js';

describe('validateUserInput()', () => {
  it('should return no errors for valid input', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      birthday: '1990-01-01',
      timezone: 'America/New_York'
    };

    const errors = validateUserInput(validUser);
    expect(errors).toHaveLength(0);
  });

  it('should detect missing fields', () => {
    const user = {};
    const errors = validateUserInput(user);

    const fields = errors.map(e => e.param);
    expect(fields).toContain('name');
    expect(fields).toContain('email');
    expect(fields).toContain('birthday');
    expect(fields).toContain('timezone');
  });

  it('should detect invalid email', () => {
    const user = {
      name: 'Jane',
      email: 'invalid-email',
      birthday: '1995-12-12',
      timezone: 'America/New_York'
    };

    const errors = validateUserInput(user);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ param: 'email' }),
        expect.objectContaining({ msg: 'Email must be a valid email address' })
      ])
    );
  });

  
  it('should detect empty email', () => {
    const user = {
      name: 'Jane',
      email: '',
      birthday: '1995-12-12',
      timezone: 'America/New_York'
    };

    const errors = validateUserInput(user);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ param: 'email' }),
        expect.objectContaining({ msg: 'Email is required' })
      ])
    );
  });

  it('should detect invalid birthday', () => {
    const user = {
      name: 'Jane',
      email: 'jane@example.com',
      birthday: 'not-a-date',
      timezone: 'America/New_York'
    };

    const errors = validateUserInput(user);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ param: 'birthday' }),
        expect.objectContaining({ msg: 'Birthday must be a valid ISO 8601 date' })
      ])
    );
  });

  it('should detect empty birthday', () => {
    const user = {
      name: 'Jane',
      email: 'test@example.com',
      birthday: '',
      timezone: 'America/New_York'
    };

    const errors = validateUserInput(user);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ param: 'birthday' }),
        expect.objectContaining({ msg: 'Birthday is required' })
      ])
    );
  });

  it('should detect invalid timezone', () => {
    const user = {
      name: 'Jane',
      email: 'jane@example.com',
      birthday: '1995-12-12',
      timezone: 'Invalid/Zone'
    };

    const errors = validateUserInput(user);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ param: 'timezone' }),
        expect.objectContaining({ msg: 'Timezone must be a valid IANA timezone string' })
      ])
    );
  });

  
  it('should detect empty timezene', () => {
    const user = {
      name: 'Jane',
      email: 'jane@example.com',
      birthday: '1995-12-12',
      timezone: ''
    };

    const errors = validateUserInput(user);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ param: 'timezone' }),
        expect.objectContaining({ msg: 'Timezone is required' })
      ])
    );
  });
});


describe('validateUserUpdate', () => {
  it('should return no errors for valid input', () => {
    const data = {
      email: 'test@example.com',
      birthday: '1990-01-01',
      timezone: 'Asia/Jakarta',
    };

    const result = validateUserUpdate(data);
    expect(result).toEqual([]);
  });

  it('should return error for invalid email format', () => {
    const data = {
      email: 'invalid-email',
    };

    const result = validateUserUpdate(data);
    expect(result).toContainEqual({
      param: 'email',
      msg: 'Email must be a valid email address',
    });
  });

  it('should return error for invalid birthday format', () => {
    const data = {
      birthday: 'not-a-date',
    };

    const result = validateUserUpdate(data);
    expect(result).toContainEqual({
      param: 'birthday',
      msg: 'Birthday must be a valid ISO 8601 date',
    });
  });

  it('should return error for invalid timezone', () => {
    const data = {
      timezone: 'Invalid/Zone',
    };

    const result = validateUserUpdate(data);
    expect(result).toContainEqual({
      param: 'timezone',
      msg: 'Timezone must be a valid IANA timezone string',
    });
  });

  it('should allow partial updates with only one valid field', () => {
    const data = {
      email: 'user@example.com',
    };

    const result = validateUserUpdate(data);
    expect(result).toEqual([]);
  });

  it('should return multiple errors for multiple invalid fields', () => {
    const data = {
      email: 'invalid-email',
      birthday: 'fake-date',
      timezone: 'Fake/Zone',
    };

    const result = validateUserUpdate(data);
    expect(result.length).toBe(3);
  });

  it('should return no errors for empty input (no update fields)', () => {
    const result = validateUserUpdate({});
    expect(result).toEqual([]);
  });
});