export class Logger {
    /**
     * Returns the console format args for a title with the specified background colour and black text
     * @param color Background colour
     * @param title Text
     * @returns Array. Destructure this into {@link Logger}.errorCustomFmt or console.log
     *
     * @example logger.errorCustomFmt(...Logger.makeTitleElements("white", "Hello"), "World");
     */
    static makeTitle(color: string, title: string): [string, ...string[]] {
        return ["%c %c %s ", "", `background: ${color}; color: black; font-weight: bold; border-radius: 5px;`, title];
    }

    static create(name: string, color: string = "white") {
        return typeof window === "undefined" ? new NoopLogger() : new Logger(name, color);
    }

    constructor(public name: string, public color: string = "white") { }

    protected _log(level: "log" | "error" | "warn" | "info" | "debug", levelColor: string, args: any[], customFmt = "") {
        console[level](
            `%c ${this.name} %c %c ${level} ${customFmt}`,
            `background: ${levelColor}; color: black; font-weight: bold; border-radius: 5px;`,
            "",
            `background: ${this.color}; color: black; font-weight: bold; border-radius: 5px;`
            , ...args
        );
    }

    public log(...args: any[]) {
        this._log("log", "#4fd6be", args);
    }

    public info(...args: any[]) {
        this._log("info", "#4fd6be", args);
    }

    public error(...args: any[]) {
        this._log("error", "#ff757f", args);
    }

    public errorCustomFmt(fmt: string, ...args: any[]) {
        this._log("error", "#ff757f", args, fmt);
    }

    public warn(...args: any[]) {
        this._log("warn", "#ffc777", args);
    }

    public debug(...args: any[]) {
        this._log("debug", "#eebebe", args);
    }
}

export class NoopLogger extends Logger {
    constructor(name: string = "NoopLoggerl", color: string = "white") {
        super(name, color);
    }
    protected override _log() { }
}
