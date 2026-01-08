16:36:46.572 Running build in Washington, D.C., USA (East) – iad1
16:36:46.572 Build machine configuration: 2 cores, 8 GB
16:36:47.045 Cloning github.com/fcbl-sft/FCBL_Production (Branch: main, Commit: ea72483)
16:36:47.046 Previous build caches not available.
16:36:47.767 Cloning completed: 721.000ms
16:36:48.549 Running "vercel build"
16:36:50.932 Vercel CLI 50.1.6
16:36:51.895 Installing dependencies...
16:37:05.120 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
16:37:07.119 
16:37:07.120 added 149 packages in 15s
16:37:07.120 
16:37:07.120 26 packages are looking for funding
16:37:07.121   run `npm fund` for details
16:37:07.166 Running "npm run build"
16:37:07.269 
16:37:07.270 > genpack-tech-system@1.0.0 build
16:37:07.270 > tsc && vite build
16:37:07.271 
16:37:16.307 components/App.tsx(3,25): error TS2307: Cannot find module './components/LoginScreen' or its corresponding type declarations.
16:37:16.307 components/App.tsx(4,23): error TS2307: Cannot find module './components/Dashboard' or its corresponding type declarations.
16:37:16.308 components/App.tsx(5,28): error TS2307: Cannot find module './components/TechPackEditor' or its corresponding type declarations.
16:37:16.308 components/App.tsx(6,30): error TS2307: Cannot find module './components/InspectionEditor' or its corresponding type declarations.
16:37:16.309 components/App.tsx(7,29): error TS2307: Cannot find module './components/MaterialControl' or its corresponding type declarations.
16:37:16.309 components/App.tsx(8,23): error TS2307: Cannot find module './components/PPMeeting' or its corresponding type declarations.
16:37:16.309 components/App.tsx(9,27): error TS2307: Cannot find module './components/InvoiceEditor' or its corresponding type declarations.
16:37:16.310 components/App.tsx(10,27): error TS2307: Cannot find module './components/PackingEditor' or its corresponding type declarations.
16:37:16.310 components/App.tsx(11,30): error TS2307: Cannot find module './components/OrderSheetEditor' or its corresponding type declarations.
16:37:16.311 components/App.tsx(12,154): error TS2307: Cannot find module './types' or its corresponding type declarations.
16:37:16.313 components/App.tsx(13,30): error TS2307: Cannot find module './constants' or its corresponding type declarations.
16:37:16.313 components/App.tsx(14,26): error TS2307: Cannot find module './lib/supabase' or its corresponding type declarations.
16:37:16.313 components/App.tsx(28,60): error TS7006: Parameter 'i' implicitly has an 'any' type.
16:37:16.313 components/App.tsx(29,55): error TS7006: Parameter 'i' implicitly has an 'any' type.
16:37:16.314 components/App.tsx(166,51): error TS7006: Parameter 'i' implicitly has an 'any' type.
16:37:16.314 components/App.tsx(168,39): error TS7006: Parameter 'i' implicitly has an 'any' type.
16:37:16.314 components/App.tsx(236,59): error TS7006: Parameter 'i' implicitly has an 'any' type.
16:37:16.314 components/App.tsx(322,29): error TS7006: Parameter 'p' implicitly has an 'any' type.
16:37:16.314 components/App.tsx(324,36): error TS7006: Parameter 'file' implicitly has an 'any' type.
16:37:16.314 components/App.tsx(351,35): error TS7006: Parameter 'id' implicitly has an 'any' type.
16:37:16.315 components/App.tsx(352,29): error TS7006: Parameter 'id' implicitly has an 'any' type.
16:37:16.315 components/App.tsx(352,33): error TS7006: Parameter 'title' implicitly has an 'any' type.
16:37:16.315 components/App.tsx(357,37): error TS7006: Parameter 'p' implicitly has an 'any' type.
16:37:16.315 components/App.tsx(358,31): error TS7006: Parameter 'p' implicitly has an 'any' type.
16:37:16.315 components/App.tsx(366,29): error TS7006: Parameter 'p' implicitly has an 'any' type.
16:37:16.316 components/App.tsx(369,28): error TS7006: Parameter 's' implicitly has an 'any' type.
16:37:16.318 components/App.tsx(370,26): error TS7006: Parameter 'txt' implicitly has an 'any' type.
16:37:16.319 components/App.tsx(380,22): error TS7006: Parameter 'orderSheet' implicitly has an 'any' type.
16:37:16.319 components/App.tsx(390,24): error TS7006: Parameter 'inv' implicitly has an 'any' type.
16:37:16.319 components/App.tsx(391,60): error TS7006: Parameter 'i' implicitly has an 'any' type.
16:37:16.319 components/App.tsx(402,24): error TS7006: Parameter 'packing' implicitly has an 'any' type.
16:37:16.319 components/App.tsx(422,29): error TS7006: Parameter 'updates' implicitly has an 'any' type.
16:37:16.319 components/App.tsx(423,22): error TS7006: Parameter 'items' implicitly has an 'any' type.
16:37:16.319 components/App.tsx(431,22): error TS7006: Parameter 'meetings' implicitly has an 'any' type.
16:37:16.319 components/PPMeeting.tsx(547,103): error TS2322: Type 'string | null' is not assignable to type 'string'.
16:37:16.320   Type 'null' is not assignable to type 'string'.
16:37:16.320 components/PPMeeting.tsx(567,110): error TS2322: Type 'string | null' is not assignable to type 'string'.
16:37:16.320   Type 'null' is not assignable to type 'string'.
16:37:16.320 geminiService.ts(3,30): error TS2307: Cannot find module '../types' or its corresponding type declarations.
16:37:16.355 Error: Command "npm run build" exited with 2
