function getArtifactPageUrl(artifactId, artifactType) {
    switch (artifactType) {
      case 'entity':
        return `/logic-objects/edit/${artifactId}`;
      case 'entity_query':
        return `/queries/edit/${artifactId}`;
      case 'entity_sample':
        return `/samples/edit/${artifactId}`;
      case 'business_entity':
        return `/business-entities/edit/${artifactId}`;
      case 'dq_rule':
        return `/dq_rule/edit/${artifactId}`;
      default:
        return `/${artifactType}s/edit/${artifactId}`;
    }
  }