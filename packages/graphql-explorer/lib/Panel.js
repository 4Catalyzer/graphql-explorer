import { GraphQLNonNull } from 'graphql';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';
import { MdClose } from 'react-icons/md';
import { useExplorer } from './ExplorerContext';
import ArgumentsForm from './forms/ArgumentsForm';
import PanelContainer, { usePanelContext } from './ui/PanelContainer';
export default function Panel({ title, type, formArgs, execute, allowSubFragment, defaultFormValue, canClose = true, }) {
    const { closePanel, closeChildPanel } = usePanelContext();
    const waitToSubmit = formArgs.filter((a) => a.type instanceof GraphQLNonNull).length > 0;
    const [input, setInputBase] = useState(waitToSubmit ? undefined : defaultFormValue);
    const [item, setItem] = useState();
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const waitingForInput = waitToSubmit && !input;
    const setInput = useCallback((newInput) => {
        setInputBase(newInput);
        closeChildPanel();
    }, [closeChildPanel]);
    const explorer = useExplorer();
    useEffect(() => {
        async function fetchData() {
            if (waitingForInput)
                return; // wait to complete input
            setLoading(true);
            try {
                const newItem = await execute(input || {});
                setItem(newItem);
                setError(undefined);
                setLoading(false);
            }
            catch (ex) {
                setError(`${ex}`); // stringify so it can be rendered
                setItem(undefined);
                setLoading(false);
            }
        }
        fetchData();
    }, [execute, input, waitingForInput]);
    const executeQuery = useCallback((fragment, newInput) => execute(newInput || input || {}, fragment), [execute, input]);
    const formContent = useMemo(() => {
        if (!formArgs || formArgs.length === 0)
            return null;
        return (React.createElement(ArgumentsForm, { args: formArgs, onSubmit: setInput, defaultValue: defaultFormValue }));
    }, [defaultFormValue, formArgs, setInput]);
    const mainSection = useMemo(() => {
        if (waitingForInput)
            return null;
        if (loading) {
            return (React.createElement(PanelContainer.Body, null,
                React.createElement("div", { style: { justifyContent: 'center', display: 'flex' } },
                    React.createElement(Spinner, { animation: "border", style: { height: '3rem', width: '3rem' } }))));
        }
        if (error) {
            return (React.createElement(ListGroup, { variant: "flush" },
                React.createElement(ListGroup.Item, { variant: "danger" },
                    React.createElement("pre", null,
                        React.createElement("code", null, error)))));
        }
        if (!item) {
            return (React.createElement(PanelContainer.Body, null,
                React.createElement("h4", null, "No item found")));
        }
        const Section = explorer.resolveType(type)?.Section;
        if (!Section)
            return null;
        return (React.createElement(Section, { item: item, type: type, executeQuery: allowSubFragment ? executeQuery : undefined, input: input }));
    }, [
        allowSubFragment,
        error,
        executeQuery,
        explorer,
        input,
        item,
        loading,
        type,
        waitingForInput,
    ]);
    return (React.createElement(React.Fragment, null,
        React.createElement(PanelContainer.Header, null,
            title,
            React.createElement("div", { className: "d-flex" }, canClose && (React.createElement(Button, { variant: "outline-secondary", onClick: closePanel },
                React.createElement(MdClose, null))))),
        formContent && React.createElement(PanelContainer.Body, null, formContent),
        mainSection));
}
//# sourceMappingURL=Panel.js.map