import { IANAZone } from 'luxon';
import validator from 'validator';

export const validateUserInput = (data) => {
    const errors = [];

    if (!data.name) errors.push({ param: 'name', msg: 'Name is required' });

    if (!data.email) {
        errors.push({ param: 'email', msg: 'Email is required' });
    } else if (!validator.isEmail(data.email)) {
        errors.push({ param: 'email', msg: 'Email must be a valid email address' });
    }

    if (!data.birthday) {
        errors.push({ param: 'birthday', msg: 'Birthday is required' });
    } else if (isNaN(Date.parse(data.birthday))) {
        errors.push({ param: 'birthday', msg: 'Birthday must be a valid ISO 8601 date' });
    }

    if (!data.timezone) {
        errors.push({ param: 'timezone', msg: 'Timezone is required' });
    } else if (!IANAZone.isValidZone(data.timezone)) {
        errors.push({ param: 'timezone', msg: 'Timezone must be a valid IANA timezone string' });
    }

    return errors;
};

export const validateUserUpdate = (data) => {
    const errors = [];

    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
        errors.push({ param: 'email', msg: 'Email must be a valid email address' });
    }

    if (data.birthday && isNaN(Date.parse(data.birthday))) {
        errors.push({ param: 'birthday', msg: 'Birthday must be a valid ISO 8601 date' });
    }

    if (data.timezone && !IANAZone.isValidZone(data.timezone)) {
        errors.push({ param: 'timezone', msg: 'Timezone must be a valid IANA timezone string' });
    }

    return errors;
}
