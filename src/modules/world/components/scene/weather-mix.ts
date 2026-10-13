// How much of each weather is showing right now (0..1), eased over a few
// seconds by WeatherDirector so changes blend in. Read every frame by the
// sky, lights, grass and rain. No three.js here.
export const weatherMix = {
  rain: 0,
  mist: 0,
  // Grey sky and dimmer sun; rain and mist both bring clouds.
  overcast: 0,
};
