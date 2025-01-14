import React, { useState, useEffect } from 'react';
import styles from '../styles/Modal.module.css';
import { getTranslation } from '../translations/Translation';
import { useLanguage } from '../translations/LanguageContext';
import scrollbarStyles from '../styles/Scrollbar.module.css';


const availablePermissions = [
  {
    group: 'Gestion des articles',
    permissions: [
      { id: 'posts_create', label: 'Créer des articles', value: { resource: 'posts', actions: ['create'] } },
      { id: 'posts_edit', label: 'Modifier des articles', value: { resource: 'posts', actions: ['update'] } },
      { id: 'posts_delete', label: 'Supprimer des articles', value: { resource: 'posts', actions: ['delete'] } },
      { id: 'posts_read', label: 'Voir les articles', value: { resource: 'posts', actions: ['read'] } }
    ]
  },
  {
    group: 'Gestion des catégories',
    permissions: [
      { id: 'categories_create', label: 'Créer des catégories', value: { resource: 'categories', actions: ['create'] } },
      { id: 'categories_edit', label: 'Modifier des catégories', value: { resource: 'categories', actions: ['update'] } },
      { id: 'categories_delete', label: 'Supprimer des catégories', value: { resource: 'categories', actions: ['delete'] } },
      { id: 'categories_read', label: 'Voir les catégories', value: { resource: 'categories', actions: ['read'] } }
    ]
  },
  {
    group: 'Gestion des tags',
    permissions: [
      { id: 'tags_create', label: 'Créer des tags', value: { resource: 'tags', actions: ['create'] } },
      { id: 'tags_edit', label: 'Modifier des tags', value: { resource: 'tags', actions: ['update'] } },
      { id: 'tags_delete', label: 'Supprimer des tags', value: { resource: 'tags', actions: ['delete'] } },
      { id: 'tags_read', label: 'Voir les tags', value: { resource: 'tags', actions: ['read'] } }
    ]
  },
  {
    group: 'Gestion des utilisateurs',
    permissions: [
      { id: 'users_create', label: 'Créer des utilisateurs', value: { resource: 'users', actions: ['create'] } },
      { id: 'users_edit', label: 'Modifier des utilisateurs', value: { resource: 'users', actions: ['update'] } },
      { id: 'users_delete', label: 'Supprimer des utilisateurs', value: { resource: 'users', actions: ['delete'] } },
      { id: 'users_read', label: 'Voir les utilisateurs', value: { resource: 'users', actions: ['read'] } }
    ]
  }
];

const RoleModal = ({ isOpen, onClose, onSubmit, role }) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePermissionChange = (resource, action, isChecked) => {
    setFormData(prev => {
      const permissions = [...prev.permissions];
      const resourceIndex = permissions.findIndex(p => p.resource === resource);

      if (resourceIndex === -1 && isChecked) {
        permissions.push({
          resource,
          actions: [action]
        });
      } else if (resourceIndex !== -1) {
        if (isChecked) {
          permissions[resourceIndex].actions = [...new Set([...permissions[resourceIndex].actions, action])];
        } else {
          permissions[resourceIndex].actions = permissions[resourceIndex].actions.filter(a => a !== action);
          if (permissions[resourceIndex].actions.length === 0) {
            permissions.splice(resourceIndex, 1);
          }
        }
      }

      return { ...prev, permissions };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, !!role);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${scrollbarStyles.modal}`}>
        <div className={styles.modalHeader}>
          <h2>{role ? getTranslation(language, 'roles_form.edit') : getTranslation(language, 'roles_form.create')}</h2>
        </div>
        <div className={`${styles.modalBody} ${scrollbarStyles.modal}`}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>{getTranslation(language, 'roles_form.name')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>{getTranslation(language, 'roles_form.description')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className={`${styles.formGroup} ${scrollbarStyles.checkboxGroup}`}>
              <label>{getTranslation(language, 'roles_form.permissions')}</label>
              <div className={`${styles.checkboxGroup} ${scrollbarStyles.checkboxGroup}`}>
                {availablePermissions.map(group => (
                  <div key={group.group} className={`${styles.permissionGroup} ${scrollbarStyles.permissionGroup}`}>
                    <h3>{group.group}</h3>
                    {group.permissions.map(perm => (
                      <div key={perm.id} className={styles.permissionItem}>
                        <input
                          type="checkbox"
                          id={perm.id}
                          checked={formData.permissions.some(
                            p => p.resource === perm.value.resource && 
                            p.actions.includes(perm.value.actions[0])
                          )}
                          onChange={(e) => handlePermissionChange(perm.value.resource, perm.value.actions[0], e.target.checked)}
                          className={styles.permissionCheckbox}
                        />
                        <label 
                          htmlFor={perm.id} 
                          className={styles.permissionLabel}
                        >
                          {perm.label}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.secondaryButton}>
                {getTranslation(language, 'roles_form.cancel')}
              </button>
              <button type="submit" className={styles.primaryButton}>
                {role ? getTranslation(language, 'roles_form.edit') : getTranslation(language, 'roles_form.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleModal; 