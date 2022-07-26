const CONSOLE_COLOR = {
  GRAY: '#999',
  BLUE: '#2e9fff',
  GREEN: '#41b838',
  RED: '#f75757',
};

const consoleStyle = (color) => `color:${color}; font-weight: bold`;

const logger = (config, name) => (set, get, api) =>
  config(
    (args) => {
      const prefix = name ? `[${name}]` : '  ';
      console.log(
        `%c${prefix}%c  prev state`,
        consoleStyle(CONSOLE_COLOR.RED),
        consoleStyle(CONSOLE_COLOR.GRAY),
        get(),
      );
      console.log(
        `%c${prefix}%c  action    `,
        consoleStyle(CONSOLE_COLOR.RED),
        consoleStyle(CONSOLE_COLOR.BLUE),
        args,
      );
      set(args);
      console.log(
        `%c${prefix}%c  next state`,
        consoleStyle(CONSOLE_COLOR.RED),
        consoleStyle(CONSOLE_COLOR.GREEN),
        get(),
      );
    },
    get,
    api,
  );

export default logger;
