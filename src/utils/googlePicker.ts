/**
 * Google Picker API Utility for client-side Drive file selection.
 * Adheres to the official Google Picker API guidelines (DocsView, DocsUploadView, origin configuration).
 */

declare const google: any;
declare const gapi: any;

export interface PickedGoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  url?: string;
  sizeBytes?: number;
  lastEditedUtc?: number;
  description?: string;
}

export interface OpenGooglePickerOptions {
  accessToken: string;
  onPicked: (file: PickedGoogleDriveFile) => void;
  onCancel?: () => void;
  title?: string;
  mimeTypes?: string;
  viewMode?: 'spreadsheets' | 'documents' | 'all';
  allowUpload?: boolean;
}

/**
 * Loads the Google API client library and the Picker module.
 */
export const loadGooglePickerApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return resolve();
    }

    if ((window as any).google?.picker) {
      return resolve();
    }

    const checkGapi = () => {
      if ((window as any).gapi) {
        (window as any).gapi.load('picker', {
          callback: () => {
            resolve();
          },
          onerror: () => {
            reject(new Error('Failed to load Google Picker module from gapi'));
          }
        });
      } else {
        const existingScript = document.getElementById('google-api-client');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'google-api-client';
          script.src = 'https://apis.google.com/js/api.js';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            (window as any).gapi?.load('picker', {
              callback: () => resolve(),
              onerror: () => reject(new Error('Failed to initialize Google Picker'))
            });
          };
          script.onerror = () => reject(new Error('Failed to load Google API script'));
          document.head.appendChild(script);
        } else {
          // Script is already in DOM, poll briefly for gapi
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if ((window as any).gapi) {
              clearInterval(interval);
              (window as any).gapi.load('picker', {
                callback: () => resolve(),
                onerror: () => reject(new Error('Failed to load Google Picker module'))
              });
            } else if (attempts > 30) {
              clearInterval(interval);
              reject(new Error('Google API client timed out'));
            }
          }, 100);
        }
      }
    };

    checkGapi();
  });
};

/**
 * Launches the Google Picker modal dialog with authenticated OAuth access token.
 */
export const openGooglePicker = async ({
  accessToken,
  onPicked,
  onCancel,
  title = 'Select Surveillance Data or Spreadsheet',
  mimeTypes,
  viewMode = 'all',
  allowUpload = true
}: OpenGooglePickerOptions): Promise<void> => {
  if (!accessToken) {
    throw new Error('Google OAuth access token is required to open Google Picker');
  }

  await loadGooglePickerApi();

  const pickerOrigin =
    window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
      ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
      : window.location.origin;

  const googleObj = (window as any).google;
  if (!googleObj?.picker) {
    throw new Error('Google Picker library failed to initialize');
  }

  const builder = new googleObj.picker.PickerBuilder()
    .setTitle(title)
    .setOAuthToken(accessToken)
    .setOrigin(pickerOrigin)
    .setCallback((data: any) => {
      if (data.action === googleObj.picker.Action.PICKED) {
        if (data.docs && data.docs.length > 0) {
          const doc = data.docs[0];
          onPicked({
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
            url: doc.url,
            sizeBytes: doc.sizeBytes,
            lastEditedUtc: doc.lastEditedUtc,
            description: doc.description
          });
        }
      } else if (data.action === googleObj.picker.Action.CANCEL) {
        onCancel?.();
      }
    });

  // Primary Views
  if (viewMode === 'spreadsheets') {
    const spreadsheetView = new googleObj.picker.DocsView(googleObj.picker.ViewId.SPREADSHEETS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    if (mimeTypes) {
      spreadsheetView.setMimeTypes(mimeTypes);
    }
    builder.addView(spreadsheetView);
  } else {
    const docsView = new googleObj.picker.DocsView(googleObj.picker.ViewId.DOCS)
      .setIncludeFolders(true);

    if (mimeTypes) {
      docsView.setMimeTypes(mimeTypes);
    }
    builder.addView(docsView);
  }

  // Allow uploading directly through Picker if enabled
  if (allowUpload) {
    builder.addView(new googleObj.picker.DocsUploadView());
  }

  const picker = builder.build();
  picker.setVisible(true);
};
