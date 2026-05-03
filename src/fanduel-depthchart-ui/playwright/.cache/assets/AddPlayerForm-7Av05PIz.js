import { j as jsxRuntimeExports } from './jsx-runtime-Oi8CS8Fg.js';
import { r as reactExports } from './index-CcNoFr6G.js';
import { a as addPlayer, t as toApiError } from './depthChart-DP6Jzb32.js';

const empty = { position: "QB", number: "", name: "", depth: "" };
function AddPlayerForm({ onAdded, onError }) {
  const [form, setForm] = reactExports.useState(empty);
  const [busy, setBusy] = reactExports.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const position = form.position.trim().toUpperCase();
    const name = form.name.trim();
    if (!position) {
      onError("Position is required.");
      return;
    }
    if (!name) {
      onError("Name is required.");
      return;
    }
    setBusy(true);
    try {
      await addPlayer({
        position,
        number: Number(form.number),
        name,
        depth: form.depth === "" ? void 0 : Number(form.depth)
      });
      onAdded(name);
      setForm(empty);
    } catch (e2) {
      const err = toApiError(e2);
      const fields = Object.values(err.fieldErrors).flat().join(" ");
      onError(fields ? `${err.message} ${fields}` : err.message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "form", onSubmit: submit, "aria-label": "Add player", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        className: "input",
        placeholder: "Position (e.g. QB)",
        value: form.position,
        onChange: (e) => setForm({ ...form, position: e.target.value.toUpperCase() }),
        autoCapitalize: "characters",
        required: true,
        "aria-label": "Position"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        className: "input input--num",
        placeholder: "Number",
        type: "number",
        min: 0,
        max: 99,
        value: form.number,
        onChange: (e) => setForm({ ...form, number: e.target.value }),
        required: true,
        "aria-label": "Jersey number"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        className: "input",
        placeholder: "Name",
        value: form.name,
        onChange: (e) => setForm({ ...form, name: e.target.value }),
        required: true,
        "aria-label": "Player name"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        className: "input input--num",
        placeholder: "Depth",
        type: "number",
        min: 0,
        value: form.depth,
        onChange: (e) => setForm({ ...form, depth: e.target.value }),
        "aria-label": "Depth (optional)"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "btn btn--primary", disabled: busy, children: busy ? "Adding…" : "Add player" })
  ] });
}

export { AddPlayerForm };
//# sourceMappingURL=AddPlayerForm-7Av05PIz.js.map
