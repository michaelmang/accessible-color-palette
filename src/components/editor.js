import React from "react";
import BaseEditor from "react-json-view";

export default function Editor({ code, onChange }) {
  function handleEdit(newCode) {
    onChange(newCode.updated_src);
  }

  return (
    <BaseEditor collapsed onEdit={handleEdit} src={code} theme="hopscotch" style={{ padding: 16 }} />
  );
}
