import { j as jsxRuntimeExports } from './jsx-runtime-Oi8CS8Fg.js';
import { r as reactExports } from './index-CcNoFr6G.js';
import { g as getBackups, t as toApiError } from './depthChart-DP6Jzb32.js';

const empty = { position: "QB", number: "" };
function BackupsLookup({ chart, onError }) {
  const [lookup, setLookup] = reactExports.useState(empty);
  const [result, setResult] = reactExports.useState(null);
  const [submitted, setSubmitted] = reactExports.useState(null);
  const submit = async (e) => {
    e.preventDefault();
    const position = lookup.position.trim().toUpperCase();
    if (!position) {
      onError("Position is required.");
      return;
    }
    try {
      const data = await getBackups(position, Number(lookup.number));
      setResult(data);
      setSubmitted({ position, number: lookup.number });
    } catch (e2) {
      onError(toApiError(e2).message);
    }
  };
  const lookedUpName = submitted ? chart[submitted.position]?.find((p) => p.number === Number(submitted.number))?.name : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "form", onSubmit: submit, "aria-label": "Look up backups", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          className: "input",
          placeholder: "Position",
          value: lookup.position,
          onChange: (e) => setLookup({ ...lookup, position: e.target.value.toUpperCase() }),
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
          value: lookup.number,
          onChange: (e) => setLookup({ ...lookup, number: e.target.value }),
          required: true,
          "aria-label": "Jersey number"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "btn btn--primary", children: "Lookup" })
    ] }),
    result !== null && submitted && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "status", "aria-live": "polite", children: result.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "empty", children: [
      "No backups for ",
      submitted.position,
      " #",
      submitted.number,
      lookedUpName ? ` (${lookedUpName})` : "",
      "."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "backups-list", children: result.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "chip", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "chip__num", children: [
        "#",
        p.number
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.name })
    ] }) }, p.number)) }) })
  ] });
}

export { BackupsLookup };
//# sourceMappingURL=BackupsLookup-WiMKz9Dz.js.map
