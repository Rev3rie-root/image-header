const { Plugin } = require('obsidian');

class ImageHeaderPlugin extends Plugin {
  async onload() {
    console.log('Image Header plugin loaded');

    // Add banner to currently active file
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      this.addBanner(activeFile);
    }

    // Add banner whenever a file is opened
    this.registerEvent(
      this.app.workspace.on('file-open', (file) => {
        if (file) {
          this.addBanner(file);
        }
      })
    );
  }

  async addBanner(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    const banner = cache && cache.frontmatter && cache.frontmatter.banner;
    if (!banner) return;

    const imageName = banner.replace(/\[\[|\]\]/g, '');
    const imageFile = this.app.metadataCache.getFirstLinkpathDest(imageName, file.path);
    if (!imageFile) return;

    const imageUrl = this.app.vault.getResourcePath(imageFile);
    this.insertBannerImage(imageUrl);
  }

insertBannerImage(imageUrl) {
  const leaf = this.app.workspace.activeLeaf;
  if (!leaf) return;

  const viewContent = leaf.view.containerEl;
  
  // Remove existing banner first
  const existingWrapper = viewContent.querySelector('.image-header-wrapper');
  if (existingWrapper) existingWrapper.remove();

  // Create wrapper and banner
  const bannerWrapper = document.createElement('div');
  bannerWrapper.className = 'image-header-wrapper';

  const bannerEl = document.createElement('img');
  bannerEl.className = 'image-header-banner';
  bannerEl.src = imageUrl;

  bannerWrapper.appendChild(bannerEl);
  
  // Find the view-content element
  const contentEl = viewContent.querySelector('.view-content');
  if (!contentEl) return;
  
  // Look for the properties/metadata section
  const metadataEl = contentEl.querySelector('.metadata-container') ||
                     contentEl.querySelector('.frontmatter-container') ||
                     contentEl.querySelector('[data-type="properties"]');
  
  if (metadataEl) {
    // Insert right after the properties
    metadataEl.parentElement.insertBefore(bannerWrapper, metadataEl.nextSibling);
  } else {
    // Fallback: insert at beginning
    contentEl.insertBefore(bannerWrapper, contentEl.firstChild);
  }
}
  onunload() {
    console.log('Image Header plugin unloaded');
    document.querySelectorAll('.image-header-wrapper').forEach(wrapper => wrapper.remove());
  }
}

module.exports = ImageHeaderPlugin;
