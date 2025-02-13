import SETTINGS from './settings.js';
import { err, warn, qs, qsById, values, floor, evaluate } from './utils.js';

const App = (({ tag, id, txt, evType, opChr, defVal, msg }) => {
  const validator = {
    overflowRgEx: new RegExp(`\\d{${defVal.maxDgts}}$`),
    endWithOpRgEx: /\D{1}$/,
    isOverflow(acc) {
      return this.overflowRgEx.test(acc);
    },
    isEndWithOp(acc) {
      return this.endWithOpRgEx.test(acc);
    },
    isDigit(chr) {
      return !isNaN(+chr);
    },
    validateInput(chr) {
      return (
        this.isDigit(chr) || [...values(txt), ...values(opChr)].includes(chr)
      );
    },
  };

  const calc = (input, acc) => {
    if (![input, ...acc].every(validator.validateInput.bind(validator)))
      err(msg.invalidChr);

    switch (true) {
      case input === txt.ac:
        return defVal.total;
      case validator.isDigit(input) && validator.isOverflow(acc):
        warn(msg.overflow);
        return acc;
      case !validator.isDigit(input) && validator.isEndWithOp(acc):
        warn(msg.noDigit);
        return acc;
      case validator.isDigit(input) && acc === defVal.total:
        return input;
      case input === opChr.eq:
        return `${floor(evaluate(acc.replaceAll(txt.multi, opChr.multi)))}`;
      default:
        return acc + input;
    }
  };

  const privatesMap = new WeakMap();
  return class {
    constructor(sel) {
      privatesMap.set(this, { sel, acc: defVal.total });
    }

    init() {
      const privates = privatesMap.get(this);

      const appEl = qs(privates.sel);
      if (!appEl) err(`${msg.noElem} (${privates.sel})`);
      const totalEl = qsById(id.total, appEl);
      if (!totalEl) err(`${msg.noElem} (#${id.total})`);

      privates.totalEl = totalEl;
      appEl.addEventListener(evType.click, this.click.bind(this));
      this.render();
    }

    click({ target }) {
      if (target?.tagName !== tag.button) return;

      const privates = privatesMap.get(this);
      const input = target.innerText;

      privates.acc = calc(input, privates.acc);
      this.render();
    }

    render() {
      const { totalEl, acc } = privatesMap.get(this);
      totalEl.innerText = acc;
    }
  };
})(SETTINGS);

export default App;
