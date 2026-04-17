import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const SchoolContext = createContext();

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within SchoolProvider');
  }
  return context;
};

export const SchoolProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('branchToken');
    if (token) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [classRes, sectionRes, feeRes] = await Promise.all([
        api.get('/api/class/all').catch(() => ({ data: { classes: [] } })),
        api.get('/api/section/all').catch(() => ({ data: { sections: [] } })),
        api.get('/api/fee/all').catch(() => ({ data: { fees: [] } }))
      ]);
      setClasses(classRes.data.classes || classRes.data || []);
      setSections(sectionRes.data.sections || sectionRes.data || []);
      setFees(feeRes.data.fees || feeRes.data || []);
    } catch (error) {
      console.error('Failed to fetch school data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshClasses = async () => {
    try {
      const res = await api.get('/api/class/all');
      setClasses(res.data.classes || res.data || []);
    } catch (error) {
      console.error('Failed to refresh classes:', error);
    }
  };

  const refreshSections = async () => {
    try {
      const res = await api.get('/api/section/all');
      setSections(res.data.sections || res.data || []);
    } catch (error) {
      console.error('Failed to refresh sections:', error);
    }
  };

  const refreshFees = async () => {
    try {
      const res = await api.get('/api/fee/all');
      setFees(res.data.fees || res.data || []);
    } catch (error) {
      console.error('Failed to refresh fees:', error);
    }
  };

  const addSection = (sectionData) => {
    const newSection = { ...sectionData, id: Date.now() };
    setSections([...sections, newSection]);
    return newSection;
  };

  const addClass = (classData) => {
    const newClass = { ...classData, id: Date.now() };
    setClasses([...classes, newClass]);
    return newClass;
  };

  const addFee = (feeData) => {
    const newFee = { ...feeData, id: Date.now() };
    setFees([...fees, newFee]);
    return newFee;
  };

  const updateClass = (id, classData) => {
    setClasses(classes.map(c => c.id === id ? { ...classData, id } : c));
  };

  const updateSection = (id, sectionData) => {
    setSections(sections.map(s => s.id === id ? { ...sectionData, id } : s));
  };

  const updateFee = (id, feeData) => {
    setFees(fees.map(f => f.id === id ? { ...feeData, id } : f));
  };

  const deleteClass = (id) => {
    setClasses(classes.filter(c => c.id !== id));
    setSections(sections.filter(s => s.classId !== id));
  };

  const deleteSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const deleteFee = (id) => {
    setFees(fees.filter(f => f.id !== id));
  };

  const getClassesBySection = (sectionName) => {
    return classes.filter(c => c.assignedSections && c.assignedSections.includes(sectionName));
  };

  const getAvailableSections = () => {
    return sections.filter(section => 
      !classes.some(cls => cls.assignedSections && cls.assignedSections.includes(section.sectionName))
    );
  };

  // Expand classes by stream: Class 11 [Science, Commerce] => [{...cls, _streamLabel: 'Science'}, {...cls, _streamLabel: 'Commerce'}]
  // If no stream, just return the class as-is with _streamLabel: null
  const expandedClasses = classes.flatMap(cls => {
    if (cls.stream && cls.stream.length > 0) {
      return cls.stream.map(s => ({ ...cls, _streamLabel: s }));
    }
    return [{ ...cls, _streamLabel: null }];
  });

  const value = {
    classes,
    expandedClasses,
    sections,
    fees,
    loading,
    refreshClasses,
    refreshSections,
    refreshFees,
    fetchAllData
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};
