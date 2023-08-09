/**
 * Given a date, returns a human-readable date string in the format "Jan 1, 2020".
 */
const getHumanReadableDate = (date: string | number | Date): string =>
  new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

/**
 * Given a date, returns a machine-readable date string suitable for use in the `datetime` attribute of the `<time>` element.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time#valid_datetime_values
 */
const getMachineReadableDate = (date: string | number | Date): string => new Date(date).toISOString()

export { getHumanReadableDate, getMachineReadableDate }
