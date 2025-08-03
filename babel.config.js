module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Utilisation du nouveau plugin react-native-worklets au lieu de react-native-reanimated/plugin
      'react-native-worklets/plugin',
    ],
  };
};
