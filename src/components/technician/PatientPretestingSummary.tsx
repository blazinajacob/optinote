import { useState } from 'react';
import { ArrowRight, Check, Eye, Eye as Eye2, AlertTriangle, FileText, Activity, ArrowUpRight, Camera, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PreTestData, ScanResult, Patient } from '../../types';
import { cn } from '../../lib/utils';

interface PatientPretestingSummaryProps {
  patient: Patient;
  pretestData?: PreTestData;
  scans?: ScanResult[];
  chiefComplaint?: string;
  className?: string;
}

const PatientPretestingSummary = ({
  patient,
  pretestData,
  scans,
  chiefComplaint,
  className
}: PatientPretestingSummaryProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Calculate completion percentages
  const getCompletionStatus = () => {
    let total = 0;
    let completed = 0;
    
    // Chief complaint
    total++;
    if (chiefComplaint) completed++;
    
    // Auto refraction
    total++;
    if (pretestData?.autoRefraction) completed++;
    
    // Visual acuity
    total++;
    if (pretestData?.vision?.rightEye?.uncorrected && pretestData?.vision?.leftEye?.uncorrected) completed++;
    
    // Cover test
    total++;
    if (pretestData?.coverTest) completed++;
    
    // Pupils
    total++;
    if (pretestData?.pupils) completed++;
    
    // Confrontation fields
    total++;
    if (pretestData?.confrontationFields) completed++;
    
    // IOP
    total++;
    if (pretestData?.intraocularPressure) completed++;
    
    return { 
      percentage: Math.round((completed / total) * 100),
      completed,
      total
    };
  };
  
  const completionStatus = getCompletionStatus();
  
  return (
    <div className={cn("bg-white shadow-sm rounded-lg overflow-hidden", className)}>
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Pre-Testing Summary</h3>
            <p className="mt-1 text-sm text-gray-600">
              {patient.firstName} {patient.lastName} • {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full",
                    completionStatus.percentage < 33 ? "bg-error-500" :
                    completionStatus.percentage < 66 ? "bg-warning-500" : 
                    "bg-success-500"
                  )}
                  style={{ width: `${completionStatus.percentage}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs font-medium text-gray-500">
                {completionStatus.percentage}%
              </span>
            </div>
            
            <p className="mt-1 text-xs text-gray-500">
              {completionStatus.completed} of {completionStatus.total} tasks completed
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Chief Complaint */}
        <div 
          className={cn(
            "border rounded-md p-3",
            chiefComplaint ? "border-success-200" : "border-gray-200",
            expandedSection === "chiefComplaint" ? "bg-gray-50" : ""
          )}
        >
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("chiefComplaint")}
          >
            <div className="flex items-center">
              <div className={cn(
                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                chiefComplaint ? "bg-success-100" : "bg-gray-100"
              )}>
                <FileText className={cn(
                  "h-4 w-4",
                  chiefComplaint ? "text-success-600" : "text-gray-400"
                )} />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Chief Complaint</h4>
                {chiefComplaint ? (
                  <p className="text-xs text-gray-500 truncate max-w-xs">{chiefComplaint}</p>
                ) : (
                  <p className="text-xs text-gray-500">Not recorded</p>
                )}
              </div>
            </div>
            
            <div>
              {chiefComplaint ? (
                <Check className="h-5 w-5 text-success-500" />
              ) : (
                <ArrowRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
          
          {expandedSection === "chiefComplaint" && chiefComplaint && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-700">{chiefComplaint}</p>
            </div>
          )}
        </div>
        
        {/* Auto Refraction */}
        <div 
          className={cn(
            "border rounded-md p-3",
            pretestData?.autoRefraction ? "border-success-200" : "border-gray-200",
            expandedSection === "autoRefraction" ? "bg-gray-50" : ""
          )}
        >
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("autoRefraction")}
          >
            <div className="flex items-center">
              <div className={cn(
                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                pretestData?.autoRefraction ? "bg-success-100" : "bg-gray-100"
              )}>
                <Eye className={cn(
                  "h-4 w-4",
                  pretestData?.autoRefraction ? "text-success-600" : "text-gray-400"
                )} />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Auto Refraction</h4>
                {pretestData?.autoRefraction ? (
                  <p className="text-xs text-gray-500">Measurements recorded for both eyes</p>
                ) : (
                  <p className="text-xs text-gray-500">Not performed</p>
                )}
              </div>
            </div>
            
            <div>
              {pretestData?.autoRefraction ? (
                <Check className="h-5 w-5 text-success-500" />
              ) : (
                <ArrowRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
          
          {expandedSection === "autoRefraction" && pretestData?.autoRefraction && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Right Eye (OD)</p>
                  <p>
                    Sphere: {pretestData.autoRefraction.rightEye.sphere >= 0 ? '+' : ''}
                    {pretestData.autoRefraction.rightEye.sphere.toFixed(2)}
                  </p>
                  <p>
                    Cylinder: {pretestData.autoRefraction.rightEye.cylinder >= 0 ? '+' : ''}
                    {pretestData.autoRefraction.rightEye.cylinder.toFixed(2)}
                  </p>
                  <p>Axis: {pretestData.autoRefraction.rightEye.axis}°</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Left Eye (OS)</p>
                  <p>
                    Sphere: {pretestData.autoRefraction.leftEye.sphere >= 0 ? '+' : ''}
                    {pretestData.autoRefraction.leftEye.sphere.toFixed(2)}
                  </p>
                  <p>
                    Cylinder: {pretestData.autoRefraction.leftEye.cylinder >= 0 ? '+' : ''}
                    {pretestData.autoRefraction.leftEye.cylinder.toFixed(2)}
                  </p>
                  <p>Axis: {pretestData.autoRefraction.leftEye.axis}°</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Visual Acuity */}
        <div 
          className={cn(
            "border rounded-md p-3",
            pretestData?.vision?.rightEye?.uncorrected && pretestData?.vision?.leftEye?.uncorrected ? "border-success-200" : "border-gray-200",
            expandedSection === "visualAcuity" ? "bg-gray-50" : ""
          )}
        >
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("visualAcuity")}
          >
            <div className="flex items-center">
              <div className={cn(
                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                pretestData?.vision?.rightEye?.uncorrected && pretestData?.vision?.leftEye?.uncorrected ? "bg-success-100" : "bg-gray-100"
              )}>
                <Eye2 className={cn(
                  "h-4 w-4",
                  pretestData?.vision?.rightEye?.uncorrected && pretestData?.vision?.leftEye?.uncorrected ? "text-success-600" : "text-gray-400"
                )} />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Visual Acuity</h4>
                {pretestData?.vision?.rightEye?.uncorrected && pretestData?.vision?.leftEye?.uncorrected ? (
                  <p className="text-xs text-gray-500">
                    OD: {pretestData.vision.rightEye.uncorrected} / OS: {pretestData.vision.leftEye.uncorrected}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">Not measured</p>
                )}
              </div>
            </div>
            
            <div>
              {pretestData?.vision?.rightEye?.uncorrected && pretestData?.vision?.leftEye?.uncorrected ? (
                <Check className="h-5 w-5 text-success-500" />
              ) : (
                <ArrowRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
          
          {expandedSection === "visualAcuity" && pretestData?.vision && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Right Eye (OD)</p>
                  <p>Uncorrected: {pretestData.vision.rightEye.uncorrected || 'Not measured'}</p>
                  <p>Corrected: {pretestData.vision.rightEye.corrected || 'Not measured'}</p>
                  <p>Pinhole: {pretestData.vision.rightEye.pinhole || 'Not measured'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Left Eye (OS)</p>
                  <p>Uncorrected: {pretestData.vision.leftEye.uncorrected || 'Not measured'}</p>
                  <p>Corrected: {pretestData.vision.leftEye.corrected || 'Not measured'}</p>
                  <p>Pinhole: {pretestData.vision.leftEye.pinhole || 'Not measured'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* IOP */}
        <div 
          className={cn(
            "border rounded-md p-3",
            pretestData?.intraocularPressure?.rightEye !== undefined && pretestData?.intraocularPressure?.leftEye !== undefined ? 
              (
                (pretestData.intraocularPressure.rightEye > 21 || pretestData.intraocularPressure.leftEye > 21) ? 
                  "border-warning-200" : "border-success-200"
              ) : 
              "border-gray-200",
            expandedSection === "iop" ? "bg-gray-50" : ""
          )}
        >
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("iop")}
          >
            <div className="flex items-center">
              <div className={cn(
                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                pretestData?.intraocularPressure?.rightEye !== undefined && pretestData?.intraocularPressure?.leftEye !== undefined ? 
                  (
                    (pretestData.intraocularPressure.rightEye > 21 || pretestData.intraocularPressure.leftEye > 21) ? 
                      "bg-warning-100" : "bg-success-100"
                  ) : 
                  "bg-gray-100"
              )}>
                <Activity className={cn(
                  "h-4 w-4",
                  pretestData?.intraocularPressure?.rightEye !== undefined && pretestData?.intraocularPressure?.leftEye !== undefined ? 
                    (
                      (pretestData.intraocularPressure.rightEye > 21 || pretestData.intraocularPressure.leftEye > 21) ? 
                        "text-warning-600" : "text-success-600"
                    ) : 
                    "text-gray-400"
                )} />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Intraocular Pressure</h4>
                {pretestData?.intraocularPressure?.rightEye !== undefined && pretestData?.intraocularPressure?.leftEye !== undefined ? (
                  <div className="flex items-center">
                    <p className="text-xs text-gray-500">
                      OD: {pretestData.intraocularPressure.rightEye} mmHg / OS: {pretestData.intraocularPressure.leftEye} mmHg
                    </p>
                    {(pretestData.intraocularPressure.rightEye > 21 || pretestData.intraocularPressure.leftEye > 21) && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Elevated
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Not measured</p>
                )}
              </div>
            </div>
            
            <div>
              {pretestData?.intraocularPressure?.rightEye !== undefined && pretestData?.intraocularPressure?.leftEye !== undefined ? (
                <Check className="h-5 w-5 text-success-500" />
              ) : (
                <ArrowRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
          
          {expandedSection === "iop" && pretestData?.intraocularPressure && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Right Eye (OD)</p>
                  <p className={cn(
                    "font-semibold",
                    pretestData.intraocularPressure.rightEye > 21 ? "text-warning-600" : "text-gray-900"
                  )}>
                    {pretestData.intraocularPressure.rightEye} mmHg
                    {pretestData.intraocularPressure.rightEye > 21 && ' (Elevated)'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Left Eye (OS)</p>
                  <p className={cn(
                    "font-semibold",
                    pretestData.intraocularPressure.leftEye > 21 ? "text-warning-600" : "text-gray-900"
                  )}>
                    {pretestData.intraocularPressure.leftEye} mmHg
                    {pretestData.intraocularPressure.leftEye > 21 && ' (Elevated)'}
                  </p>
                </div>
              </div>
              
              {(pretestData.intraocularPressure.rightEye > 21 || pretestData.intraocularPressure.leftEye > 21) && (
                <div className="mt-3 p-2 bg-warning-50 border border-warning-200 rounded text-sm text-warning-800 flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <p>
                    Elevated IOP detected. Please notify the doctor immediately.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Additional Tests */}
        <div 
          className={cn(
            "border rounded-md p-3",
            scans && scans.length > 0 ? "border-success-200" : "border-gray-200",
            expandedSection === "additionalTests" ? "bg-gray-50" : ""
          )}
        >
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("additionalTests")}
          >
            <div className="flex items-center">
              <div className={cn(
                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                scans && scans.length > 0 ? "bg-success-100" : "bg-gray-100"
              )}>
                <Camera className={cn(
                  "h-4 w-4",
                  scans && scans.length > 0 ? "text-success-600" : "text-gray-400"
                )} />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Additional Tests</h4>
                {scans && scans.length > 0 ? (
                  <p className="text-xs text-gray-500">
                    {scans.length} test{scans.length !== 1 ? 's' : ''} performed
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">No additional tests</p>
                )}
              </div>
            </div>
            
            <div>
              {scans && scans.length > 0 ? (
                <Check className="h-5 w-5 text-success-500" />
              ) : (
                <ArrowRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
          
          {expandedSection === "additionalTests" && scans && scans.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <ul className="space-y-2">
                {scans.map((scan) => (
                  <li key={scan.id} className="text-sm flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-700">
                        {scan.type === 'oct' ? 'OCT Scan' :
                         scan.type === 'fundus' ? 'Fundus Photography' :
                         scan.type === 'visual_field' ? 'Visual Field' :
                         scan.type === 'topography' ? 'Topography' :
                         scan.type === 'pachymetry' ? 'Pachymetry' :
                         scan.type === 'iol_master' ? 'IOL Master' :
                         'Other Test'}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {new Date(scan.date).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      className="text-primary-600 hover:text-primary-800 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(scan.imageUrl, '_blank');
                      }}
                    >
                      View <ArrowUpRight className="h-3 w-3 inline" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Anomalies or Warnings */}
        {(
          (pretestData?.intraocularPressure?.rightEye && pretestData.intraocularPressure.rightEye > 21) ||
          (pretestData?.intraocularPressure?.leftEye && pretestData.intraocularPressure.leftEye > 21) ||
          (pretestData?.pupils?.rightEye?.RAPD || pretestData?.pupils?.leftEye?.RAPD) ||
          (pretestData?.confrontationFields?.rightEye && (!pretestData.confrontationFields.rightEye.superior || 
                                                       !pretestData.confrontationFields.rightEye.inferior || 
                                                       !pretestData.confrontationFields.rightEye.nasal || 
                                                       !pretestData.confrontationFields.rightEye.temporal)) ||
          (pretestData?.confrontationFields?.leftEye && (!pretestData.confrontationFields.leftEye.superior || 
                                                       !pretestData.confrontationFields.leftEye.inferior || 
                                                       !pretestData.confrontationFields.leftEye.nasal || 
                                                       !pretestData.confrontationFields.leftEye.temporal)) ||
          (pretestData?.colorVision?.rightEye?.result === 'deficient' || pretestData?.colorVision?.leftEye?.result === 'deficient')
        ) && (
          <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-warning-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-warning-800">Abnormal findings detected</h4>
                <div className="mt-2 text-sm text-warning-700 space-y-1">
                  {(pretestData?.intraocularPressure?.rightEye && pretestData.intraocularPressure.rightEye > 21) && (
                    <p className="flex items-start">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-warning-500 mt-1.5 mr-2"></span>
                      Elevated IOP in right eye ({pretestData.intraocularPressure.rightEye} mmHg)
                    </p>
                  )}
                  {(pretestData?.intraocularPressure?.leftEye && pretestData.intraocularPressure.leftEye > 21) && (
                    <p className="flex items-start">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-warning-500 mt-1.5 mr-2"></span>
                      Elevated IOP in left eye ({pretestData.intraocularPressure.leftEye} mmHg)
                    </p>
                  )}
                  {pretestData?.pupils?.rightEye?.RAPD && (
                    <p className="flex items-start">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-warning-500 mt-1.5 mr-2"></span>
                      RAPD detected in right eye
                    </p>
                  )}
                  {pretestData?.pupils?.leftEye?.RAPD && (
                    <p className="flex items-start">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-warning-500 mt-1.5 mr-2"></span>
                      RAPD detected in left eye
                    </p>
                  )}
                  {pretestData?.confrontationFields?.rightEye && (!pretestData.confrontationFields.rightEye.superior || 
                                                                !pretestData.confrontationFields.rightEye.inferior || 
                                                                !pretestData.confrontationFields.rightEye.nasal || 
                                                                !pretestData.confrontationFields.rightEye.temporal) && (
                    <p className="flex items-start">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-warning-500 mt-1.5 mr-2"></span>
                      Visual field defect detected in right eye
                    </p>
                  )}
                  {pretestData?.confrontationFields?.leftEye && (!pretestData.confrontationFields.leftEye.superior || 
                                                               !pretestData.confrontationFields.leftEye.inferior || 
                                                               !pretestData.confrontationFields.leftEye.nasal || 
                                                               !pretestData.confrontationFields.leftEye.temporal) && (
                    <p className="flex items-start">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-warning-500 mt-1.5 mr-2"></span>
                      Visual field defect detected in left eye
                    </p>
                  )}
                  {pretestData?.colorVision?.rightEye?.result === 'deficient' && (
                    <p className="flex items-start">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-warning-500 mt-1.5 mr-2"></span>
                      Color vision deficiency in right eye
                    </p>
                  )}
                  {pretestData?.colorVision?.leftEye?.result === 'deficient' && (
                    <p className="flex items-start">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-warning-500 mt-1.5 mr-2"></span>
                      Color vision deficiency in left eye
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPretestingSummary;