export default function FieldError({ messages }) {
    if (!messages?.length) return null;
    return <small className="field-error" role="alert">{messages.join(' ')}</small>;
}
