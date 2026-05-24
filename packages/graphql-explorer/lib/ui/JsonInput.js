import isEqual from 'lodash/isEqual';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Form from 'react-bootstrap/Form';
import * as yup from 'yup';
const INVALID_JSON = Symbol('invalid json'); // sentinel value
export const jsonField = () => yup.mixed().test({
    name: 'isJson',
    test: (v) => v !== INVALID_JSON,
    message: 'invalid JSON payload',
});
export function JsonInput({ value, onChange, ...props }) {
    const serialize = useCallback((v) => JSON.stringify(v, undefined, 2), []);
    const [innerValue, setInnerValue] = useState(serialize(value));
    const parsedInnerValue = useMemo(() => {
        try {
            return JSON.parse(innerValue);
        }
        catch {
            return INVALID_JSON;
        }
    }, [innerValue]);
    useEffect(() => {
        if (parsedInnerValue !== INVALID_JSON &&
            value !== INVALID_JSON &&
            !isEqual(value, parsedInnerValue)) {
            setInnerValue(serialize(value));
        }
    }, [innerValue, parsedInnerValue, serialize, value]);
    const handleChange = useCallback((e) => {
        const newValue = e.target.value;
        try {
            const parsedNewValue = JSON.parse(newValue);
            onChange(parsedNewValue);
        }
        catch {
            onChange(INVALID_JSON);
        }
        setInnerValue(newValue);
    }, [onChange]);
    return (React.createElement(Form.Control, { ...props, as: "textarea", rows: 3, style: { fontFamily: 'monospace' }, value: innerValue, onChange: handleChange }));
}
//# sourceMappingURL=JsonInput.js.map