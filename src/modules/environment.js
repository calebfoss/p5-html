import { P5Function } from "./base";

export default [
  class Describe extends P5Function {
    constructor() {
      super(["text, [display]"]);
    }
  },
  class DescribeElement extends P5Function {
    constructor() {
      super(["name, text, [display]"]);
    }
  },
  class TextOutput extends P5Function {
    constructor() {
      super(["[display]"]);
    }
  },
  class GridOutput extends P5Function {
    constructor() {
      super(["[display]"]);
    }
  },
  class Print extends P5Function {
    constructor() {
      super(["contents"]);
    }
  },
  class Cursor extends P5Function {
    constructor() {
      super(["type, [x], [y]"]);
    }
  },
  class FrameRate extends P5Function {
    constructor() {
      super(["", "fps"]);
    }
  },
];
