p5.prototype._gettersAndSetters.push({
  name: "angle_mode",
  get: function () {
    return this._angleMode;
  },
  set: function (mode) {
    this._setProperty("_angleMode", mode);
  },
});
