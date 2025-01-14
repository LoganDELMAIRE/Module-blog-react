import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import RoleModal from './RoleModal';
import styles from '../styles/Admin.module.css';
import { useLanguage } from '../translations/LanguageContext';
import { getTranslation } from '../translations/Translation';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

const RolesList = () => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/blog/roles');
      setRoles(response.data);
    } catch (error) {
      logger.error('Error during roles loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData, isEdit) => {
    try {
      if (isEdit) {
        await axios.put(`/api/blog/roles/${editingRole._id}`, formData);
        alert('Role modified successfully!');
      } else {
        await axios.post('/api/blog/roles', formData);
        alert('Role created successfully!');
      }
      setFormData({ name: '', description: '', permissions: [] });
      setEditingRole(null);
      setIsModalOpen(false);
      fetchRoles();
    } catch (error) {
      logger.error('Error during role saving:', error);
      alert('Error during role saving');
    }
  };

  const handleDelete = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role ?')) {
      try {
        await axios.delete(`/api/blog/roles/${roleId}`);
        alert('Role deleted successfully!');
        fetchRoles();
      } catch (error) {
        logger.error('Error during role deletion:', error);
        alert('Error during role deletion');
      }
    }
  };

  const formatPermissions = (permissions) => {
    const groupedPermissions = permissions.reduce((acc, perm) => {
      if (perm.resource === '*') {
        acc[getTranslation(language, 'roles_list.all_resources')] = [getTranslation(language, 'roles_list.all_permissions')];
        return acc;
      }
      
      const resourceName = {
        'posts': getTranslation(language, 'list_articles.title_articles'),
        'users': getTranslation(language, 'sidebar.users'),
        'categories': getTranslation(language, 'sidebar.categories'),
        'tags': getTranslation(language, 'sidebar.tags')
      }[perm.resource] || perm.resource;

      const actionNames = {
        'create': getTranslation(language, 'form_tag.create'),
        'read': getTranslation(language, 'list_articles.title'),
        'update': getTranslation(language, 'list_articles.edit'),
        'delete': getTranslation(language, 'list_articles.delete'),
        'manage': getTranslation(language, 'roles_list.permissions')
      };

      acc[resourceName] = perm.actions.map(action => actionNames[action] || action);
      return acc;
    }, {});

    return (
      <div className={styles.permissionsContainer}>
        {Object.entries(groupedPermissions).map(([resource, actions]) => (
          <div key={resource} className={styles.permissionGroup}>
            <div className={styles.resourceName}>{resource}</div>
            <div className={styles.actionsList}>
              {actions.map(action => (
                <span key={action} className={styles.actionTag}>
                  {action}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className={styles.postsListContainer}>
      <div className={styles.postsListHeader}>
        <h2>{getTranslation(language, 'roles_list.roles_management')}</h2>
        <button
          className={styles.primaryButton}
          onClick={() => {
            setEditingRole(null);
            setIsModalOpen(true);
          }}
        >
          {getTranslation(language, 'roles_list.new_role')}
        </button>
      </div>

      <div className={styles.postsTable}>
        <table>
          <thead>
            <tr>
              <th>{getTranslation(language, 'roles_list.name')}</th>
              <th>{getTranslation(language, 'roles_list.description')}</th>
              <th>{getTranslation(language, 'roles_list.type')}</th>
              <th>{getTranslation(language, 'roles_list.permissions')}</th>
              <th id="actions">{getTranslation(language, 'roles_list.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role._id}>
                <td data-label={getTranslation(language, 'roles_list.name')}>
                  {role.name}
                </td>
                <td data-label={getTranslation(language, 'roles_list.description')}>
                  {role.description}
                </td>
                <td data-label={getTranslation(language, 'roles_list.type')}>
                  <span className={`${styles.roleTag} ${styles[role.isSystem ? 'system' : 'custom']}`}>
                    {role.isSystem ? getTranslation(language, 'roles_list.system') : 'Custom'}
                  </span>
                </td>
                <td data-label={getTranslation(language, 'roles_list.permissions')}>
                  {formatPermissions(role.permissions)}
                </td>
                <td data-label={getTranslation(language, 'roles_list.actions')}>
                  <div className={styles.actions}>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleEdit(role)}
                      disabled={role.isSystem}
                    >
                      {getTranslation(language, 'list_articles.edit')}
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(role._id)}
                      disabled={role.isSystem}
                    >
                      {getTranslation(language, 'list_articles.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RoleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRole(null);
        }}
        onSubmit={handleSubmit}
        role={editingRole}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};

export default RolesList; 