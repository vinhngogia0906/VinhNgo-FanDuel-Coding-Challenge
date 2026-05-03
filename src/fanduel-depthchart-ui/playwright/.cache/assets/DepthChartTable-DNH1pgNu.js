import { j as jsxRuntimeExports } from './jsx-runtime-Oi8CS8Fg.js';
import { r as removePlayer, t as toApiError } from './depthChart-DP6Jzb32.js';
import './index-CcNoFr6G.js';

function DepthChartTable({ chart, onRemoved, onError }) {
  const positions = Object.keys(chart).filter((p) => chart[p].length > 0).sort();
  const remove = async (position, p) => {
    try {
      await removePlayer(position, p.number);
      onRemoved(p.name);
    } catch (e) {
      onError(toApiError(e).message);
    }
  };
  if (positions.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "empty", children: "No players yet — add your first via the form below." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chart-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "chart", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("caption", { className: "visually-hidden", children: "Depth chart by position" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", children: "Pos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", children: "Players (depth ascending)" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: positions.map((pos) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pos", children: pos }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: chart[pos].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "chip", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "chip__num", children: [
          "#",
          p.number
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "icon-btn",
            onClick: () => remove(pos, p),
            "aria-label": `Remove ${p.name} from ${pos}`,
            title: "Remove",
            children: "×"
          }
        )
      ] }, p.number)) })
    ] }, pos)) })
  ] }) });
}

export { DepthChartTable };
//# sourceMappingURL=DepthChartTable-DNH1pgNu.js.map
