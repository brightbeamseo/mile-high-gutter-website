import {homePage} from './homePage'
import {siteSettings} from './siteSettings'
import {cityServicePage} from './cityServicePage'
import {legalPage} from './legalPage'
import {faqPage} from './faqPage'
import {galleryPage} from './galleryPage'
import {contactPage} from './contactPage'
import {reviewsPage} from './reviewsPage'
import {blogPost} from './blogPost'
import {homepageObjectTypes} from './objectTypes'

export const schemaTypes = [
  siteSettings,
  homePage,
  cityServicePage,
  blogPost,
  legalPage,
  faqPage,
  galleryPage,
  contactPage,
  reviewsPage,
  ...homepageObjectTypes,
]
