import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Text, Divider } from '@chakra-ui/core';
import NavigationBar from '../components/NavigationBar';
import HeaderGrid from '../components/HeaderGrid';
import ResponsiveHeading from '../components/ResponsiveHeading';
import Container from '../components/Container';
import ResourceCard from '../components/ResourceCard';
import { RESPONSIVE_TEXT_ALIGN } from '../styles/responsiveStyles';
import { fetchBuilds, fetchUsers, fetchTags, fetchResources } from '../clients';
import {
  BuildListProps,
  TagListProps,
  UserListProps,
  ResourceListProps,
} from '../constants/propTypes';
import Builds from '../components/Builds';

export default function User({
  id,
  name,
  email,
  createdBuilds,
  favoritedBuilds,
  uploadedResources,
  favoritedResources,
  tags,
  users,
}) {
  return (
    <div>
      <NavigationBar />
      <HeaderGrid>
        <Avatar size="xl" name={name} m="auto" />
        <Box>
          <ResponsiveHeading showDivider>{name}</ResponsiveHeading>
          <Text textAlign={RESPONSIVE_TEXT_ALIGN} mb={5}>
            {email}
          </Text>
        </Box>
        <Box>
          <Text textAlign={RESPONSIVE_TEXT_ALIGN}>{`ID: ${id}`}</Text>
        </Box>
      </HeaderGrid>

      {/* Creations/uploads */}
      <Container>
        {/* User's created builds */}
        <Box>
          <Builds builds={createdBuilds} tags={tags} users={users} />
          {!createdBuilds && (
            <Text textAlign={RESPONSIVE_TEXT_ALIGN}>
              {`${name} hasn't made any builds... yet.`}
            </Text>
          )}
        </Box>

        {/* User's resources */}
        <Box>
          <ResponsiveHeading>Resources</ResponsiveHeading>
          <Text textAlign={RESPONSIVE_TEXT_ALIGN}>
            {!uploadedResources && (
              <Text textAlign={RESPONSIVE_TEXT_ALIGN}>
                {`${name} hasn't uploaded any resources... yet.`}
              </Text>
            )}
            {uploadedResources &&
              uploadedResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
          </Text>
        </Box>
      </Container>

      <Divider />

      {/* User's favorites */}
      <Container>
        {/* User's favorited builds */}
        <Box>
          <Builds
            builds={favoritedBuilds}
            tags={tags}
            users={users}
            header="Favorite Builds"
          />
          {!favoritedBuilds && (
            <Text textAlign={RESPONSIVE_TEXT_ALIGN}>
              {`${name} hasn't favorited any builds... yet.`}
            </Text>
          )}
        </Box>

        {/* User's favorited resources */}
        <Box>
          <ResponsiveHeading>Favorite Resources</ResponsiveHeading>
          <Text textAlign={RESPONSIVE_TEXT_ALIGN}>
            {!favoritedResources && (
              <Text textAlign={RESPONSIVE_TEXT_ALIGN}>
                {`${name} hasn't favorited any resources... yet.`}
              </Text>
            )}
            {favoritedResources &&
              favoritedResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
          </Text>
        </Box>
      </Container>
    </div>
  );
}

User.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  createdBuilds: BuildListProps,
  favoritedBuilds: BuildListProps,
  uploadedResources: ResourceListProps,
  favoritedResources: ResourceListProps,
  tags: TagListProps.isRequired,
  users: UserListProps.isRequired,
};

User.defaultProps = {
  createdBuilds: null,
  favoritedBuilds: null,
  uploadedResources: null,
  favoritedResources: null,
};

// TODO(Renzo): add fallback page at some point?

export async function getStaticPaths() {
  const users = await fetchUsers();
  const paths = users.map((user) => `/${user.id}`);
  return { paths, fallback: false };
}

export async function getStaticProps(context) {
  const userId = context.params.user;
  const users = await fetchUsers();
  const {
    id,
    name,
    email,
    buildsCreated,
    resourcesUploaded,
    buildsFavorited,
    resourcesFavorited,
  } = users.find((t) => t.id === userId);

  // Get builds if available
  const allBuilds = await fetchBuilds();
  let createdBuilds = null;
  let favoritedBuilds = null;

  if (buildsCreated) {
    createdBuilds = allBuilds.filter((build) => buildsCreated.includes(build.id),
    );
  }
  if (buildsFavorited) {
    favoritedBuilds = allBuilds.filter((build) => buildsFavorited.includes(build.id),
    );
  }

  // Get resources if available
  const allResources = await fetchResources();
  let uploadedResources = null;
  let favoritedResources = null;

  if (resourcesUploaded) {
    uploadedResources = allResources.filter((resource) => resourcesUploaded.includes(resource.id),
    );
  }
  if (resourcesFavorited) {
    favoritedResources = allResources.filter((resource) => resourcesFavorited.includes(resource.id),
    );
  }

  return {
    props: {
      id,
      name,
      email,
      createdBuilds,
      favoritedBuilds,
      uploadedResources,
      favoritedResources,
      tags: await fetchTags(),
      users,
    },
  };
}
