const { Plugin } = require('obsidian');

class ImageHeaderPlugin extends Plugin {
  async onload() {
    console.log('Image Header plugin loaded');

    // Banner the active file on start-up
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) this.addBanner(activeFile);

    // Banner every file that gets opened
    this.registerEvent(
      this.app.workspace.on('file-open', (file) => {
        if (file) this.addBanner(file);
      })
    );
  }

  async addBanner(file) {
    // Grab frontmatter banner field
    const cache = this.app.metadataCache.getFileCache(file);
    const banner = cache?.frontmatter?.banner;
    if (!banner) return;

    // Resolve [[image.png]] → TFile
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

    // Remove old banner if present
    const existing = viewContent.querySelector('.image-header-wrapper');
    if (existing) existing.remove();

    // Build new banner
    const wrapper = document.createElement('div');
    wrapper.className = 'image-header-wrapper';

    const img = document.createElement('img');
    img.className = 'image-header-banner';
    img.src = imageUrl;

    wrapper.appendChild(img);

    // Insert into DOM
    const contentEl = viewContent.querySelector('.view-content');
    if (!contentEl) return;

    // Reserve space at the top of the note
    const bannerHeight = 180; // px – keep in sync with CSS
    contentEl.style.paddingTop = `${bannerHeight}px`;

    // Place banner at the very top of the scrollable area
    contentEl.insertAdjacentElement('afterbegin', wrapper);
  }

  onunload() {
    console.log('Image Header plugin unloaded');
    document.querySelectorAll('.image-header-wrapper').forEach(el => el.remove());
    // Clean up any padding we added
    document.querySelectorAll('.view-content').forEach(el => {
      el.style.paddingTop = '';
    });
  }
}

module.exports = ImageHeaderPlugin;
