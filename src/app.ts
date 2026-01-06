interface JSZipObject {
  file(name: string, data: Blob): this;
  generateAsync(options: {type: 'blob'}): Promise<Blob>;
}

interface JSZipConstructor {
  new (): JSZipObject;
}

declare const JSZip: JSZipConstructor;

class BulkResizer {
  private fileInput: HTMLInputElement;
  private resizeBtn: HTMLButtonElement;
  private downloadBtn: HTMLButtonElement;
  private progressBar: HTMLProgressElement;
  private progressContainer: HTMLDivElement;
  private statusText: HTMLElement;
  private logArea: HTMLElement;
  private downloadSection: HTMLElement;
  // We use 'null' initially since it isn't created until the user clicks resize
  private zip: JSZipObject | null = null;
  private processedBlob: Blob | null = null;

  constructor() {
    this.fileInput = document.getElementById('fileInput') as HTMLInputElement;
    this.resizeBtn = document.getElementById('resizeBtn') as HTMLButtonElement;
    this.downloadBtn = document.getElementById(
      'downloadBtn',
    ) as HTMLButtonElement;
    this.progressBar = document.getElementById(
      'progressBar',
    ) as HTMLProgressElement;
    this.progressContainer = document.getElementById(
      'progress-container',
    ) as HTMLDivElement;
    this.statusText = document.getElementById('statusText') as HTMLElement;
    this.logArea = document.getElementById('log') as HTMLElement;
    this.downloadSection = document.getElementById(
      'downloadSection',
    ) as HTMLElement;

    this.initListeners();
  }

  private initListeners() {
    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files && this.fileInput.files.length > 0) {
        this.resizeBtn.disabled = false;
        this.log(`Selected ${this.fileInput.files.length} files.`);
      } else {
        this.resizeBtn.disabled = true;
      }
    });

    this.resizeBtn.addEventListener('click', () => {
      void this.startProcessing();
    });

    this.downloadBtn.addEventListener('click', () => {
      if (this.processedBlob) {
        const url = URL.createObjectURL(this.processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resized-photos.zip';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  private async startProcessing() {
    const files = this.fileInput.files;
    if (!files || files.length === 0) return;

    // Initialize the specific JSZip object
    this.zip = new JSZip();

    this.progressContainer.style.display = 'block';
    this.downloadSection.classList.add('hidden');
    this.resizeBtn.disabled = true;
    this.logArea.innerHTML = '';

    const maxWidth =
      parseInt(
        (document.getElementById('maxWidth') as HTMLInputElement).value,
      ) || 1920;
    const maxHeight =
      parseInt(
        (document.getElementById('maxHeight') as HTMLInputElement).value,
      ) || 1080;
    const quality =
      parseFloat(
        (document.getElementById('quality') as HTMLInputElement).value,
      ) || 0.8;

    this.progressBar.max = files.length;
    this.progressBar.value = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.statusText.innerText = `Processing ${i + 1}/${files.length}: ${file.name}`;

      try {
        const resizedBlob = await this.resizeImage(
          file,
          maxWidth,
          maxHeight,
          quality,
        );
        // Use strict null check (this.zip could theoretically be null if not init, but we know it is)
        if (this.zip) {
          this.zip.file(`resized_${file.name}`, resizedBlob);
        }
        this.log(`✓ Resized: ${file.name}`);
      } catch (error) {
        console.error(error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.log(`✗ Error processing ${file.name}: ${errorMessage}`);
      }

      this.progressBar.value = i + 1;
    }

    void this.finalizeZip();
  }

  private resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            blob => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas to Blob failed'));
            },
            file.type,
            quality,
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private async finalizeZip() {
    if (!this.zip) return;

    this.statusText.innerText = 'Generating ZIP file...';

    try {
      this.processedBlob = await this.zip.generateAsync({type: 'blob'});
      this.downloadSection.classList.remove('hidden');
      this.statusText.innerText = 'Done! Ready to download.';
      this.resizeBtn.disabled = false;
    } catch (e) {
      console.error(e);
      this.log('Error generating ZIP file.');
    }
  }

  private log(msg: string) {
    const div = document.createElement('div');
    div.innerText = msg;
    this.logArea.prepend(div);
  }
}

new BulkResizer();
