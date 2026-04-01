import React, { createContext, useContext, useState } from 'react';

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

  const value = {
    classes,
    sections,
    fees,
    addClass,
    addSection,
    addFee,
    updateClass,
    updateSection,
    updateFee,
    deleteClass,
    deleteSection,
    deleteFee,
    getClassesBySection,
    getAvailableSections
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};