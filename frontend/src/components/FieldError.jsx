export default function FieldError({ messages }) {
    if (!messages?.length) return null;
    return <><br /><small role="alert">{messages.join(' ')}</small></>;
}
