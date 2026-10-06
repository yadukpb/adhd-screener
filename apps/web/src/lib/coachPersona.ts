// The app's one AI persona -- same name/avatar everywhere it shows up
// (floating widget, /coach page, per-session results chat), so it reads as
// one assistant with context that varies, not several different chats.
// Avatar is a generated illustrated portrait (DiceBear "notionists" style,
// MIT-licensed), not a photo of a real person -- there's no real "Maya" to
// get consent from, and a real stock photo would misuse an actual person's
// likeness for a fictional persona. beardProbability/glassesProbability are
// forced to 0 so the randomized seed can't drift onto features that read
// as a different gender presentation than intended.
export const COACH_NAME = "Maya";
export const COACH_TAGLINE = "Your ADHD coach";
export const COACH_AVATAR_URL =
  "https://api.dicebear.com/9.x/notionists/svg?seed=maya5&backgroundColor=c0aede,ffd5dc,d1d4f9&beardProbability=0&glassesProbability=0&radius=50";
