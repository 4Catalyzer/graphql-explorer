import { GraphQLScalarType } from 'graphql';
import isEqual from 'lodash/isEqual';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Form from 'react-bootstrap/Form';
import * as yup from 'yup';

import config from './config';

const JSON_TYPES = new Set(['JSON', 'JSONObject']);

const INVALID_JSON = Symbol('invalid json');

interface JsonInputProps {
  value: unknown;

  [idx: string]: any;
}

function JsonInput({ value, onChange, ...props }: JsonInputProps) {
  const serialize = useCallback((v) => JSON.stringify(v, undefined, 2), []);

  const [innerValue, setInnerValue] = useState(serialize(value));
  const parsedInnerValue = useMemo(() => {
    try {
      return JSON.parse(innerValue);
    } catch (e) {
      return INVALID_JSON;
    }
  }, [innerValue]);

  useEffect(() => {
    if (
      parsedInnerValue !== INVALID_JSON &&
      value !== INVALID_JSON &&
      !isEqual(value, parsedInnerValue)
    ) {
      setInnerValue(serialize(value));
    }
  }, [innerValue, parsedInnerValue, serialize, value]);

  const handleChange = useCallback(
    (e: any) => {
      const newValue = e.target.value;
      try {
        const parsedNewValue = JSON.parse(newValue);
        onChange(parsedNewValue);
      } catch (ex) {
        onChange(INVALID_JSON);
      }

      setInnerValue(newValue);
    },
    [onChange],
  );

  return (
    <Form.Control
      {...props}
      as="textarea"
      rows="3"
      style={{ fontFamily: 'monospace' }}
      value={innerValue}
      onChange={handleChange}
    />
  );
}

export function addCommonFields() {
  config.addInputField({
    check: (type) =>
      type instanceof GraphQLScalarType && JSON_TYPES.has(type.name),
    getSchema: () =>
      yup.mixed().test({
        name: 'isJson',
        test: (v) => v !== INVALID_JSON,
        message: 'invalid JSON payload',
      }),
    Component: JsonInput,
  });
}
