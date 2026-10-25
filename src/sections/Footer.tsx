import { brand, credits } from '../content'

// Placeholder footer. The model credit is a CC BY 4.0 requirement, so it ships from day one.
export function Footer() {
  return (
    <footer className="footer">
      <p>{brand.name}</p>
      <p>{credits.concept}</p>
      <p>
        <a href={credits.model.href} target="_blank" rel="noreferrer">
          {credits.model.text}
        </a>{' '}
        (
        <a href={credits.model.licenseHref} target="_blank" rel="noreferrer">
          license
        </a>
        )
      </p>
      <p>{new Date().getFullYear()}</p>
    </footer>
  )
}
