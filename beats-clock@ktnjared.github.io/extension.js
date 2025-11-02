const { GObject, St, Clutter, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;

const BeatsIndicator = GObject.registerClass(
    class BeatsIndicator extends St.Label {
        static {
            GObject.registerClass(this);
        }

        _init() {
            super._init({
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'beats-clock-indicator',
            });

            this._timeoutId = null;
            this._update();
        }

        _getSwatchTime() {
            const date = new Date();
            const [hours, minutes, seconds, milliseconds] = [(date.getUTCHours() + 1) % 24, date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()];
            const timeInMilliseconds = ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
            const millisecondsPerBeat = 86400;
            const swatchTime = Math.abs(timeInMilliseconds / millisecondsPerBeat);
            return `@${swatchTime.toFixed(2)}`;
        }

        _update() {
            this.set_text(this._getSwatchTime());
            this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 864, () => {
                this._update();
                return GLib.SOURCE_REMOVE;
            });
        }

        destroy() {
            if (this._timeoutId) {
                GLib.source_remove(this._timeoutId);
                this._timeoutId = null;
            }
            super.destroy();
        }
    }
);

export default class BeatsExtension {
    constructor(uuid) {
        this._uuid = uuid;
        this._indicator = null;
    }

    enable() {
        this._indicator = new BeatsIndicator();
        Main.panel._centerBox.insert_child_at_index(this._indicator, 0);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
