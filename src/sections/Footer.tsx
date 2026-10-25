import { brand, credits } from '../content'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer__wordmark">
        {brand.name}
        <span className="footer__arabic" lang="ar">
          {brand.arabic}
        </span>
      </p>
      <div className="footer__credits">
        <p>{credits.concept}</p>
        {/* CC BY 4.0 attribution: the exact credit text, linking to the model and the license. */}
        <p>
          <a href={credits.model.href} target="_blank" rel="noreferrer">
            {credits.model.title}
          </a>
          ,{' '}
          <a href={credits.model.licenseHref} target="_blank" rel="noreferrer">
            {credits.model.license}
          </a>
        </p>
      </div>
      <p className="footer__year">{new Date().getFullYear()}</p>
    </footer>
  )
}
