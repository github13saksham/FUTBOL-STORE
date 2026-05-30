"use client";

import React, { useState } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Product } from '@/data/mockData';
import { UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import ExcelJS from 'exceljs';

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'ready' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  
  const dbService = new FirebaseDatabaseService();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.match(/\.(xlsx)$/)) {
      setErrorMessage('Please upload a valid Excel (.xlsx) file.');
      setStatus('error');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (selectedFile: File) => {
    setStatus('parsing');
    setErrorMessage('');
    setSuccessCount(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        
        if (workbook.worksheets.length === 0) throw new Error('No worksheets found in the Excel file.');

        // Safely extract text from any cell type (handles Rich Text, formulas, numbers, strings)
        const getCellValue = (cell: ExcelJS.Cell | undefined): string => {
          if (!cell || cell.value === null || cell.value === undefined) return '';
          const val = cell.value as any;
          if (typeof val === 'object' && val.richText) {
            return val.richText.map((rt: any) => rt.text).join('').trim();
          }
          if (typeof val === 'object' && val.result !== undefined) {
            return String(val.result).trim();
          }
          return String(val).trim();
        };

        const getMappedKey = (header: string) => {
          if (!header) return null;
          header = header.toLowerCase();
          if (header.includes('url') || header.includes('link') || header.includes('image') || header.includes('pic')) return 'image';
          
          // Check for club FIRST to prevent "Club Name" or "Team Name" from being hijacked by the 'name' matcher
          if (header.includes('club') || header.includes('team') || header.includes('national')) return 'club';
          
          // Then check for product name
          if (header.includes('name') || header.includes('title') || header.includes('product') || header.includes('item')) return 'name';
          
          if (header.includes('price') || header.includes('cost') || header.includes('amount') || header.includes('mrp')) return 'price';
          if (header.includes('cat') || header.includes('type') || header.includes('version')) return 'category';
          if (header.includes('color')) return 'color';
          if (header.includes('desc') || header.includes('info') || header.includes('detail')) return 'desc';
          return null;
        };

        let allParsedData: any[] = [];
        let totalImagesCount = 0;
        let totalExtractedImagesCount = 0;

        for (const worksheet of workbook.worksheets) {
          if (worksheet.rowCount === 0) continue;

          // 1. Dynamic Column Mapping
          const headers: string[] = [];
          const headerRow = worksheet.getRow(1);
          
          headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            headers[colNumber] = getCellValue(cell).toLowerCase();
          });

          const initialColumnMap: Record<number, string> = {};
          headers.forEach((h, colNumber) => {
            if (h) {
              const key = getMappedKey(h);
              if (key) initialColumnMap[colNumber] = key;
            }
          });

          // 2. Extract Row Data
          const parsedData: any[] = [];
          let currentColumnMap = { ...initialColumnMap };

          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1 && Object.keys(initialColumnMap).length > 0) return; // Skip first row if it was a header
            
            // Check if this row is a new header row (useful for multiple tables in one sheet)
            let tempColumnMap: Record<number, string> = {};
            let mappedKeyCount = 0;
            row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
              const val = getCellValue(cell);
              if (val) {
                const key = getMappedKey(val);
                if (key) {
                  tempColumnMap[colNumber] = key;
                  mappedKeyCount++;
                }
              }
            });

            // If we found a new header row
            if (Object.values(tempColumnMap).includes('name') && mappedKeyCount >= 2) {
              currentColumnMap = tempColumnMap;
              return; // Skip parsing this row as data
            }

            // If no valid column map exists yet, skip
            if (Object.keys(currentColumnMap).length === 0) return;

            const rowData: any = {};
            let hasAnyData = false;
            
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              const key = currentColumnMap[colNumber];
              if (key) {
                const val = getCellValue(cell);
                if (val) hasAnyData = true;
                rowData[key] = val;
              }
            });
            
            // Accept the row if it has any valid text data
            if (hasAnyData || rowData.name) {
              rowData._rowNumber = rowNumber; // track row for image mapping
              rowData._worksheetName = worksheet.name; // track worksheet
              if (!rowData.name) rowData.name = `Untitled Jersey ${rowNumber}`;
              
              // Smart team detection right here for the preview
              let derivedClub = rowData.club;
              const nameUpper = rowData.name.toUpperCase();
              const clubUpper = derivedClub ? derivedClub.toUpperCase() : '';
              const nationalTeams = ['ARGENTINA', 'PORTUGAL', 'SPAIN', 'BRAZIL', 'FRANCE', 'GERMANY', 'ENGLAND', 'ITALY', 'NETHERLANDS', 'JAPAN', 'BELGIUM'];
              const isNationalTeam = nationalTeams.some(team => nameUpper.includes(team) || clubUpper.includes(team));
              
              if (isNationalTeam) {
                derivedClub = 'National Team';
              } else {
                derivedClub = 'Club';
              }
              rowData.club = derivedClub;

              parsedData.push(rowData);
            }
          });

          // 3. Extract Embedded Images
          const images = worksheet.getImages();
          totalImagesCount += images.length;
          let extractedImagesCount = 0;
          
          for (const img of images) {
            const rowNumber = Math.floor(img.range.tl.row) + 1; 
            
            let imageModel = workbook.getImage(img.imageId as any as number);
            
            // Fallback: search media array directly if getImage fails
            if (!imageModel) {
              const mediaArray = (workbook as any).model?.media || [];
              imageModel = mediaArray.find((m: any) => m.index === img.imageId || String(m.index) === String(img.imageId));
            }

            if (imageModel && imageModel.buffer) {
              const ext = imageModel.extension || 'png';
              const fileObj = new File([imageModel.buffer], `embedded_${worksheet.name}_${rowNumber}.${ext}`, { type: `image/${ext}` });
              
              // Try to find the exact row, or the closest row
              const targetRow = parsedData.find(r => r._rowNumber === rowNumber);
              if (targetRow) {
                targetRow._embeddedImageFile = fileObj;
                extractedImagesCount++;
              } else {
                 // fuzzy match: assign to the nearest row if the image is floating weirdly
                 if (parsedData.length > 0) {
                   const nearestRow = parsedData.reduce((prev, curr) => 
                     Math.abs(curr._rowNumber - rowNumber) < Math.abs(prev._rowNumber - rowNumber) ? curr : prev
                   );
                   if (nearestRow && !nearestRow._embeddedImageFile) {
                     nearestRow._embeddedImageFile = fileObj;
                     extractedImagesCount++;
                   }
                 }
              }
            }
          }
          totalExtractedImagesCount += extractedImagesCount;
          allParsedData.push(...parsedData);
        }

        if (allParsedData.length === 0) {
          throw new Error('No valid products found in any worksheet.');
        }

        // Attach diagnostic data to the preview array as a property
        (allParsedData as any)._diagnostic = {
           totalImages: totalImagesCount,
           mappedImages: totalExtractedImagesCount
        };

        setPreview(allParsedData);
        setStatus('ready');
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || 'Failed to parse the Excel file.');
        setStatus('error');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error reading the file from disk.');
      setStatus('error');
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (preview.length === 0) return;
    
    setStatus('uploading');
    setSuccessCount(0);
    try {
      const batchSize = 10;
      let currentSuccessCount = 0;

      for (let i = 0; i < preview.length; i += batchSize) {
        const batch = preview.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (row) => {
          let finalImageUrl = row.image || ''; 

          if (row._embeddedImageFile) {
            try {
              finalImageUrl = await dbService.uploadProductImage(row._embeddedImageFile);
            } catch (uploadErr) {
              console.error(`Failed to upload embedded image for row ${row._rowNumber}`, uploadErr);
            }
          }

          const priceNum = Number(row.price?.toString().replace(/[^0-9.-]+/g,"")) || 0;
          const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'product';
          const randomCode = Math.random().toString(36).substring(2, 6);
          const newId = `${slug}-${randomCode}`;

          const product: Product = {
            id: newId,
            name: row.name,
            club: row.club, // club is already resolved during parse phase
            price: priceNum,
            priceStr: `₹${priceNum.toLocaleString('en-IN')}`,
            image: finalImageUrl,
            category: (row.category || 'home').toLowerCase().replace(' ', '_'),
            color: row.color || 'Default',
            desc: row.desc || '',
            inventory: { S: 10, M: 10, L: 10, XL: 10 } 
          };

          try {
            await dbService.addProduct(product);
            currentSuccessCount++;
          } catch (dbErr) {
            console.error(`Failed to add product to DB: ${product.name}`, dbErr);
          }
        }));
      }

      setSuccessCount(currentSuccessCount);

      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred while uploading to the database.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-luxury-dark mb-1">Smart Bulk Upload</h1>
        <p className="text-luxury-taupe text-sm">Upload any Excel (.xlsx) file. We will dynamically map the columns and extract embedded images automatically.</p>
      </div>

      <div className="bg-white rounded-xl border border-luxury-taupe/20 shadow-sm overflow-hidden mb-8">
        <div className="p-8 md:p-12 border-b border-luxury-taupe/10 flex flex-col items-center justify-center text-center">
          
          <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center text-luxury-dark mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-serif text-luxury-dark mb-2">Drop your Excel file here</h2>
          <p className="text-sm text-luxury-taupe max-w-md mx-auto mb-8">
            You can name your columns however you want (e.g. "Product Title", "Team", "Cost"). You can paste URLs OR paste images directly inside the Excel cells.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative">
              <input 
                type="file" 
                accept=".xlsx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="flex items-center gap-2 px-8 py-3 bg-luxury-dark text-luxury-ivory font-bold tracking-wide rounded shadow-md text-sm hover:bg-black transition-colors pointer-events-none">
                Select Excel File
              </button>
            </div>
          </div>
        </div>

        {/* Status Area */}
        <div className="p-6 bg-[#F8F9FA]">
          {status === 'idle' && (
            <p className="text-sm text-luxury-taupe text-center py-4">Waiting for file upload...</p>
          )}

          {status === 'parsing' && (
            <div className="flex items-center justify-center gap-2 text-luxury-dark py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Scanning file and extracting images...</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center text-center py-4 text-red-600">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center text-center py-4 text-green-600">
              <CheckCircle className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">Successfully uploaded {successCount} out of {preview.length} products to the live database!</p>
              <button 
                onClick={() => { setStatus('idle'); setFile(null); setPreview([]); }}
                className="mt-4 text-xs uppercase tracking-widest underline text-luxury-dark"
              >
                Upload Another File
              </button>
            </div>
          )}

          {(status === 'ready' || status === 'uploading') && (
            <div>
              <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                <div>
                  <h3 className="font-bold text-luxury-dark text-sm">Preview ({preview.length} products found)</h3>
                  {((preview as any)._diagnostic?.totalImages > 0) && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      <CheckCircle className="w-3 h-3 inline mr-1" /> 
                      Successfully extracted {(preview as any)._diagnostic.mappedImages} embedded images out of {(preview as any)._diagnostic.totalImages} detected in the file.
                    </p>
                  )}
                  {((preview as any)._diagnostic?.totalImages === 0) && (
                    <p className="text-xs text-amber-600 font-medium mt-1">
                      <AlertCircle className="w-3 h-3 inline mr-1" /> 
                      No embedded images were detected by the scanner. Ensure images are pasted "over cells" and not as internal cell formulas.
                    </p>
                  )}
                </div>
                {status === 'ready' && (
                  <button 
                    onClick={handleUpload}
                    className="bg-luxury-dark text-luxury-ivory px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded shadow hover:bg-black transition-colors"
                  >
                    Confirm & Upload All
                  </button>
                )}
                {status === 'uploading' && (
                  <div className="flex items-center gap-2 text-luxury-dark bg-white px-4 py-2 rounded shadow-sm border border-luxury-taupe/20">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-wider">Uploading to Database...</span>
                  </div>
                )}
              </div>

              <div className="max-h-96 overflow-auto border border-luxury-taupe/20 rounded bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3F4F6] sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="p-3 font-bold text-luxury-dark whitespace-nowrap">Name</th>
                      <th className="p-3 font-bold text-luxury-dark whitespace-nowrap">Club / National Team</th>
                      <th className="p-3 font-bold text-luxury-dark whitespace-nowrap">Price</th>
                      <th className="p-3 font-bold text-luxury-dark whitespace-nowrap">Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((row, i) => (
                      <tr key={i} className="border-b border-luxury-taupe/10 hover:bg-[#F8F9FA]">
                        <td className="p-3 font-medium text-luxury-dark truncate max-w-[200px]">{row.name || '-'}</td>
                        <td className="p-3 whitespace-nowrap text-luxury-taupe">{row.club || '-'}</td>
                        <td className="p-3 whitespace-nowrap text-luxury-taupe">{row.price ? `₹${row.price}` : '-'}</td>
                        <td className="p-3 whitespace-nowrap">
                          {row._embeddedImageFile ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold tracking-wider">
                              <CheckCircle className="w-3 h-3" /> EMBEDDED FILE
                            </span>
                          ) : row.image ? (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px] font-bold tracking-wider truncate max-w-[150px]">
                              URL PROVIDED
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 50 && (
                <p className="text-xs text-center mt-3 text-luxury-taupe font-medium">Showing first 50 rows...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
