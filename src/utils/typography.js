import Typography from "typography"

// Did not use a theme here. If you want to use theme, see https://kyleamathews.github.io/typography.js/.
const typography = new Typography()

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
