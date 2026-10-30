import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Option "mo:core/Option";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import AccessControl "mo:caffeineai-authorization/access-control";



actor {
  // TYPES

  type LocalizedText = {
    en : Text;
    fr : Text;
    es : Text;
  };

  public type Profile = {
    fullName : Text;
    title : Text;
    headline : LocalizedText;
    bioShort : LocalizedText;
    bio : LocalizedText;
    avatarUrl : Text;
    location : Text;
    email : Text;
    orcidId : Text;
    orcidUrl : Text;
    linkedinUrl : ?Text;
    githubUrl : ?Text;
    cvDownloadUrl : ?Text;
  };

  public type Experience = {
    id : Nat;
    title : LocalizedText;
    organization : Text;
    location : Text;
    startDate : Text;
    endDate : ?Text;
    description : LocalizedText;
    tags : [Text];
    displayOrder : Nat;
  };

  public type Education = {
    id : Nat;
    degree : LocalizedText;
    institution : Text;
    location : Text;
    field : LocalizedText;
    startYear : Nat;
    endYear : Nat;
    thesisHost : ?Text;
    notes : LocalizedText;
    displayOrder : Nat;
  };

  public type Publication = {
    id : Nat;
    title : Text;
    authors : Text;
    venue : Text;
    year : Nat;
    doi : Text;
    url : Text;
    isPreprint : Bool;
    featured : Bool;
    displayOrder : Nat;
  };

  public type Language = {
    id : Nat;
    name : LocalizedText;
    level : LocalizedText;
    displayOrder : Nat;
  };

  public type SocialLink = {
    id : Nat;
    platform : Text;
    url : Text;
    displayOrder : Nat;
  };

  public type RelevantLink = {
    id : Nat;
    title : LocalizedText;
    url : Text;
    description : ?LocalizedText;
    displayOrder : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  public type RelevantLinkInput = {
    title : LocalizedText;
    url : Text;
    description : ?LocalizedText;
    displayOrder : Nat;
  };

  public type ObjectiveStatus = {
    #NotStarted;
    #InProgress;
    #Completed;
  };

  public type ObjectiveWithStatus = {
    objective : Text;
    status : ObjectiveStatus;
  };

  public type OngoingProject = {
    id : Nat;
    title : LocalizedText;
    fundingSource : LocalizedText;
    objectives : LocalizedText;
    workplan : LocalizedText;
    objectiveStatuses : [ObjectiveWithStatus];
    gallery : [Text];
    displayOrder : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  public type OngoingProjectInput = {
    title : LocalizedText;
    fundingSource : LocalizedText;
    objectives : LocalizedText;
    workplan : LocalizedText;
    objectiveStatuses : [ObjectiveWithStatus];
    gallery : [Text];
    displayOrder : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // COMPARATORS

  module Experience {
    public func compare(a : Experience, b : Experience) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  module Education {
    public func compare(a : Education, b : Education) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  module Publication {
    public func compare(a : Publication, b : Publication) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  module Language {
    public func compare(a : Language, b : Language) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  module SocialLink {
    public func compare(a : SocialLink, b : SocialLink) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  module RelevantLink {
    public func compare(a : RelevantLink, b : RelevantLink) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  module OngoingProject {
    public func compare(a : OngoingProject, b : OngoingProject) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  // STATE

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var profile : ?Profile = null;

  let experiencesMap = Map.empty<Nat, Experience>();
  var nextExperienceId = 1;

  let educationMap = Map.empty<Nat, Education>();
  var nextEducationId = 1;

  let publicationsMap = Map.empty<Nat, Publication>();
  var nextPublicationId = 1;

  let languagesMap = Map.empty<Nat, Language>();
  var nextLanguageId = 1;

  let socialLinksMap = Map.empty<Nat, SocialLink>();
  var nextSocialLinkId = 1;

  let relevantLinksMap = Map.empty<Nat, RelevantLink>();
  var nextRelevantLinkId = 1;

  let ongoingProjectsMap = Map.empty<Nat, OngoingProject>();
  var nextProjectId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();

  // USER PROFILE FUNCTIONS

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(userProfile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, userProfile);
  };

  // PROFILE

  public query ({ caller }) func getProfile() : async ?Profile {
    profile;
  };

  public shared ({ caller }) func updateProfile(newProfile : Profile) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    profile := ?newProfile;
  };

  // EXPERIENCE

  public query ({ caller }) func getAllExperiences() : async [Experience] {
    experiencesMap.values().toArray().sort();
  };

  public query ({ caller }) func getExperienceById(id : Nat) : async ?Experience {
    experiencesMap.get(id);
  };

  public shared ({ caller }) func createExperience(input : Experience) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = nextExperienceId;
    let newExperience : Experience = {
      input with
      id;
    };
    experiencesMap.add(id, newExperience);
    nextExperienceId += 1;
    id;
  };

  public shared ({ caller }) func updateExperience(id : Nat, experience : Experience) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not experiencesMap.containsKey(id)) { Runtime.trap("Experience not found") };
    experiencesMap.add(id, experience);
  };

  public shared ({ caller }) func deleteExperience(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not experiencesMap.containsKey(id)) { Runtime.trap("Experience not found") };
    experiencesMap.remove(id);
  };

  public shared ({ caller }) func updateExperienceOrder(order : [(Nat, Nat)]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    for ((id, displayOrder) in order.values()) {
      switch (experiencesMap.get(id)) {
        case (null) { Runtime.trap("Experience not found") };
        case (?exp) {
          let updated = { exp with displayOrder };
          experiencesMap.add(id, updated);
        };
      };
    };
  };

  // EDUCATION

  public query ({ caller }) func getAllEducation() : async [Education] {
    educationMap.values().toArray().sort();
  };

  public query ({ caller }) func getEducationById(id : Nat) : async ?Education {
    educationMap.get(id);
  };

  public shared ({ caller }) func createEducation(input : Education) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = nextEducationId;
    let newEducation : Education = {
      input with
      id;
    };
    educationMap.add(id, newEducation);
    nextEducationId += 1;
    id;
  };

  public shared ({ caller }) func updateEducation(id : Nat, education : Education) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not educationMap.containsKey(id)) { Runtime.trap("Education not found") };
    educationMap.add(id, education);
  };

  public shared ({ caller }) func deleteEducation(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not educationMap.containsKey(id)) { Runtime.trap("Education not found") };
    educationMap.remove(id);
  };

  public shared ({ caller }) func updateEducationOrder(order : [(Nat, Nat)]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    for ((id, displayOrder) in order.values()) {
      switch (educationMap.get(id)) {
        case (null) { Runtime.trap("Education not found") };
        case (?edu) {
          let updated = { edu with displayOrder };
          educationMap.add(id, updated);
        };
      };
    };
  };

  // PUBLICATIONS

  public query ({ caller }) func getAllPublications() : async [Publication] {
    publicationsMap.values().toArray().sort();
  };

  public query ({ caller }) func getPublicationById(id : Nat) : async ?Publication {
    publicationsMap.get(id);
  };

  public shared ({ caller }) func createPublication(input : Publication) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = nextPublicationId;
    let newPublication : Publication = {
      input with
      id;
    };
    publicationsMap.add(id, newPublication);
    nextPublicationId += 1;
    id;
  };

  public shared ({ caller }) func updatePublication(id : Nat, publication : Publication) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not publicationsMap.containsKey(id)) { Runtime.trap("Publication not found") };
    publicationsMap.add(id, publication);
  };

  public shared ({ caller }) func deletePublication(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not publicationsMap.containsKey(id)) { Runtime.trap("Publication not found") };
    publicationsMap.remove(id);
  };

  public shared ({ caller }) func updatePublicationOrder(order : [(Nat, Nat)]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    for ((id, displayOrder) in order.values()) {
      switch (publicationsMap.get(id)) {
        case (null) { Runtime.trap("Publication not found") };
        case (?pub) {
          let updated = { pub with displayOrder };
          publicationsMap.add(id, updated);
        };
      };
    };
  };

  // LANGUAGES

  public query ({ caller }) func getAllLanguages() : async [Language] {
    languagesMap.values().toArray().sort();
  };

  public query ({ caller }) func getLanguageById(id : Nat) : async ?Language {
    languagesMap.get(id);
  };

  public shared ({ caller }) func createLanguage(input : Language) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = nextLanguageId;
    let newLanguage : Language = {
      input with
      id;
    };
    languagesMap.add(id, newLanguage);
    nextLanguageId += 1;
    id;
  };

  public shared ({ caller }) func updateLanguage(id : Nat, language : Language) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not languagesMap.containsKey(id)) { Runtime.trap("Language not found") };
    languagesMap.add(id, language);
  };

  public shared ({ caller }) func deleteLanguage(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not languagesMap.containsKey(id)) { Runtime.trap("Language not found") };
    languagesMap.remove(id);
  };

  public shared ({ caller }) func updateLanguageOrder(order : [(Nat, Nat)]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    for ((id, displayOrder) in order.values()) {
      switch (languagesMap.get(id)) {
        case (null) { Runtime.trap("Language not found") };
        case (?lang) {
          let updated = { lang with displayOrder };
          languagesMap.add(id, updated);
        };
      };
    };
  };

  // SOCIAL LINKS

  public query ({ caller }) func getAllSocialLinks() : async [SocialLink] {
    socialLinksMap.values().toArray().sort();
  };

  public query ({ caller }) func getSocialLinkById(id : Nat) : async ?SocialLink {
    socialLinksMap.get(id);
  };

  public shared ({ caller }) func createSocialLink(input : SocialLink) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = nextSocialLinkId;
    let newLink : SocialLink = {
      input with
      id;
    };
    socialLinksMap.add(id, newLink);
    nextSocialLinkId += 1;
    id;
  };

  public shared ({ caller }) func updateSocialLink(id : Nat, link : SocialLink) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not socialLinksMap.containsKey(id)) { Runtime.trap("Social link not found") };
    socialLinksMap.add(id, link);
  };

  public shared ({ caller }) func deleteSocialLink(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not socialLinksMap.containsKey(id)) { Runtime.trap("Social link not found") };
    socialLinksMap.remove(id);
  };

  public shared ({ caller }) func updateSocialLinksOrder(order : [(Nat, Nat)]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    for ((id, displayOrder) in order.values()) {
      switch (socialLinksMap.get(id)) {
        case (null) { Runtime.trap("Social link not found") };
        case (?link) {
          let updated = { link with displayOrder };
          socialLinksMap.add(id, updated);
        };
      };
    };
  };

  // RELEVANT LINKS

  public query ({ caller }) func getAllRelevantLinks() : async [RelevantLink] {
    relevantLinksMap.values().toArray().sort();
  };

  public query ({ caller }) func getRelevantLinkById(id : Nat) : async ?RelevantLink {
    relevantLinksMap.get(id);
  };

  public shared ({ caller }) func createRelevantLink(input : RelevantLinkInput) : async RelevantLink {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = nextRelevantLinkId;
    let now = Time.now();
    let newLink : RelevantLink = {
      id;
      title = input.title;
      url = input.url;
      description = input.description;
      displayOrder = input.displayOrder;
      createdAt = now;
      updatedAt = now;
    };
    relevantLinksMap.add(id, newLink);
    nextRelevantLinkId += 1;
    newLink;
  };

  public shared ({ caller }) func updateRelevantLink(id : Nat, input : RelevantLinkInput) : async ?RelevantLink {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (relevantLinksMap.get(id)) {
      case (null) { null };
      case (?existing) {
        let updated : RelevantLink = {
          existing with
          title = input.title;
          url = input.url;
          description = input.description;
          displayOrder = input.displayOrder;
          updatedAt = Time.now();
        };
        relevantLinksMap.add(id, updated);
        ?updated;
      };
    };
  };

  public shared ({ caller }) func deleteRelevantLink(id : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not relevantLinksMap.containsKey(id)) { return false };
    relevantLinksMap.remove(id);
    true;
  };

  public shared ({ caller }) func updateRelevantLinksOrder(ids : [Nat]) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    var order = 0;
    for (id in ids.values()) {
      switch (relevantLinksMap.get(id)) {
        case (null) { return false };
        case (?link) {
          let updated = { link with displayOrder = order; updatedAt = Time.now() };
          relevantLinksMap.add(id, updated);
        };
      };
      order += 1;
    };
    true;
  };

  // ONGOING PROJECTS

  public query ({ caller }) func getAllOngoingProjects() : async [OngoingProject] {
    ongoingProjectsMap.values().toArray().sort();
  };

  public query ({ caller }) func getOngoingProjectById(id : Nat) : async ?OngoingProject {
    ongoingProjectsMap.get(id);
  };

  public shared ({ caller }) func createOngoingProject(input : OngoingProjectInput) : async OngoingProject {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = nextProjectId;
    let now = Time.now();
    let newProject : OngoingProject = {
      id;
      title = input.title;
      fundingSource = input.fundingSource;
      objectives = input.objectives;
      workplan = input.workplan;
      objectiveStatuses = input.objectiveStatuses;
      gallery = input.gallery;
      displayOrder = input.displayOrder;
      createdAt = now;
      updatedAt = now;
    };
    ongoingProjectsMap.add(id, newProject);
    nextProjectId += 1;
    newProject;
  };

  public shared ({ caller }) func updateOngoingProject(id : Nat, input : OngoingProjectInput) : async ?OngoingProject {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (ongoingProjectsMap.get(id)) {
      case (null) { null };
      case (?existing) {
        let updated : OngoingProject = {
          existing with
          title = input.title;
          fundingSource = input.fundingSource;
          objectives = input.objectives;
          workplan = input.workplan;
          objectiveStatuses = input.objectiveStatuses;
          gallery = input.gallery;
          displayOrder = input.displayOrder;
          updatedAt = Time.now();
        };
        ongoingProjectsMap.add(id, updated);
        ?updated;
      };
    };
  };

  public shared ({ caller }) func deleteOngoingProject(id : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not ongoingProjectsMap.containsKey(id)) { return false };
    ongoingProjectsMap.remove(id);
    true;
  };

  public shared ({ caller }) func updateOngoingProjectOrder(ids : [Nat]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    var order = 1;
    for (id in ids.values()) {
      switch (ongoingProjectsMap.get(id)) {
        case (null) { Runtime.trap("Ongoing project not found") };
        case (?proj) {
          let updated = { proj with displayOrder = order; updatedAt = Time.now() };
          ongoingProjectsMap.add(id, updated);
        };
      };
      order += 1;
    };
  };

  public shared ({ caller }) func addGalleryImage(projectId : Nat, imageUrl : Text) : async ?OngoingProject {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (ongoingProjectsMap.get(projectId)) {
      case (null) { null };
      case (?proj) {
        let newGallery = proj.gallery.concat([imageUrl]);
        let updated : OngoingProject = { proj with gallery = newGallery; updatedAt = Time.now() };
        ongoingProjectsMap.add(projectId, updated);
        ?updated;
      };
    };
  };

  public shared ({ caller }) func removeGalleryImage(projectId : Nat, imageUrl : Text) : async ?OngoingProject {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (ongoingProjectsMap.get(projectId)) {
      case (null) { null };
      case (?proj) {
        let newGallery = proj.gallery.filter(func(u : Text) : Bool { u != imageUrl });
        let updated : OngoingProject = { proj with gallery = newGallery; updatedAt = Time.now() };
        ongoingProjectsMap.add(projectId, updated);
        ?updated;
      };
    };
  };

  // SEED DATA

  private func doSeed() {
    // Profile
    let initialProfile : Profile = {
      fullName = "Moctar Kante";
      title = "Ph.D. | M.Sc. | Agronomist";
      headline = {
        en = "Plant Breeder & Quantitative Geneticist";
        fr = "S\u{00e9}lectionneur et G\u{00e9}n\u{00e9}ticien Quantitatif";
        es = "Mejorador de Plantas y Genetista Cuantitativo";
      };
      bioShort = {
        en = "Agronomist and plant breeder specializing in sorghum and potato improvement. Expertise in quantitative genetics, genomic selection, QTL mapping, and multi-environment breeding. Based at the International Potato Center, Lima.";
        fr = "Agronome et s\u{00e9}lectionneur sp\u{00e9}cialis\u{00e9} dans l'am\u{00e9}lioration du sorgho et de la pomme de terre. Expertise en g\u{00e9}n\u{00e9}tique quantitative, s\u{00e9}lection g\u{00e9}nomique, cartographie QTL et essais multi-environnements. Bas\u{00e9} au Centre International de la Pomme de Terre, Lima.";
        es = "Agr\u{00f3}nomo y mejorador de plantas especializado en sorgo y papa. Experiencia en gen\u{00e9}tica cuantitativa, selecci\u{00f3}n gen\u{00f3}mica, mapeo de QTL y ensayos multi-ambiente. Basado en el Centro Internacional de la Papa, Lima.";
      };
      bio = {
        en = "Agronomist and plant breeder with over a decade of experience integrating quantitative genetics, genomics, and field-based breeding to accelerate genetic gain in resource-constrained systems. Currently Associate Scientist at the International Potato Center (CIP), Lima, Peru, leading potato breeding pipelines for international partners and markets. Previous work spans sorghum hybrid breeding in West Africa, genomic selection implementation for tetraploid potato, molecular marker panel development, and breeding resource allocation optimization. Trained in Germany, Spain, and Senegal. Committed to decision-oriented analytics, sustainable breeding, and digital innovation in agricultural research.";
        fr = "Agronome et s\u{00e9}lectionneur avec plus d'une d\u{00e9}cennie d'exp\u{00e9}rience alliant g\u{00e9}n\u{00e9}tique quantitative, g\u{00e9}nomique et s\u{00e9}lection en champ pour acc\u{00e9}l\u{00e9}rer le gain g\u{00e9}n\u{00e9}tique dans des syst\u{00e8}mes \u{00e0} ressources limit\u{00e9}es. Actuellement Associate Scientist au Centre International de la Pomme de Terre (CIP), Lima, P\u{00e9}rou, responsable des pipelines de s\u{00e9}lection vari\u{00e9}tale pour des partenaires et march\u{00e9}s internationaux.";
        es = "Agr\u{00f3}nomo y mejorador de plantas con m\u{00e1}s de una d\u{00e9}cada de experiencia integrando gen\u{00e9}tica cuantitativa, gen\u{00f3}mica y mejoramiento de campo para acelerar la ganancia gen\u{00e9}tica en sistemas con recursos limitados. Actualmente Associate Scientist en el Centro Internacional de la Papa (CIP), Lima, Per\u{00fa}, liderando pipelines de mejoramiento para socios y mercados internacionales.";
      };
      avatarUrl = "/assets/uploads/avatar-placeholder.png";
      location = "Lima, Peru";
      email = "m.kante@cgiar.org";
      orcidId = "0000-0003-4669-3132";
      orcidUrl = "https://orcid.org/0000-0003-4669-3132";
      linkedinUrl = ?"https://www.linkedin.com/in/moctarkante";
      githubUrl = null;
      cvDownloadUrl = null;
    };

    profile := ?initialProfile;

    // Experiences
    let experience1 : Experience = {
      id = 1;
      title = {
        en = "Associate Scientist - Plant Breeder & Molecular Geneticist";
        fr = "Scientifique Associ\u{00e9} - S\u{00e9}lectionneur & G\u{00e9}n\u{00e9}ticien Mol\u{00e9}culaire";
        es = "Cient\u{00ed}fico Asociado - Mejorador de Plantas & Genetista Molecular";
      };
      organization = "International Potato Center (CIP)";
      location = "Lima, Peru";
      startDate = "2021-08-01";
      endDate = null;
      description = {
        en = "Leading genomics-assisted breeding for potato late blight and virus resistance. Coordinating multi-location trials, genomic selection pipelines, and variety release processes for international partners and markets. Also developing microhaplotype databases for multiple crop species.";
        fr = "Pilotage de la s\u{00e9}lection assist\u{00e9}e par marqueurs g\u{00e9}nomiques pour la r\u{00e9}sistance au mildiou et aux virus de la pomme de terre. Coordination des essais multi-sites, des pipelines de s\u{00e9}lection g\u{00e9}nomique et des processus de diffusion vari\u{00e9}tale pour des partenaires internationaux. D\u{00e9}veloppement de bases de donn\u{00e9}es de microhaplotypes pour plusieurs esp\u{00e8}ces cultiv\u{00e9}es.";
        es = "Liderazgo de la mejora asistida por gen\u{00f3}mica para resistencia al tiz\u{00f3}n tard\u{00ed}o y virus en papa. Coordinaci\u{00f3}n de ensayos multi-localidad, pipelines de selecci\u{00f3}n gen\u{00f3}mica y procesos de liberaci\u{00f3}n de variedades para socios internacionales. Desarrollo de bases de datos de microhaplotipos para m\u{00fa}ltiples especies de cultivo.";
      };
      tags = ["potato breeding", "genomic selection", "late blight", "microhaplotypes", "molecular genetics"];
      displayOrder = 1;
    };

    let experience2 : Experience = {
      id = 2;
      title = {
        en = "Research Associate - Plant Breeder & Molecular Geneticist";
        fr = "Assistant de Recherche - S\u{00e9}lectionneur & G\u{00e9}n\u{00e9}ticien Mol\u{00e9}culaire";
        es = "Asociado de Investigaci\u{00f3}n - Mejorador de Plantas & Genetista Molecular";
      };
      organization = "International Potato Center (CIP)";
      location = "Lima, Peru";
      startDate = "2019-09-01";
      endDate = ?"2021-08-01";
      description = {
        en = "Conducted marker-assisted selection, QTL mapping, and genomic selection for late blight and virus resistance traits in potato. Developed KASP molecular marker panels and contributed to multi-environment trial analysis and breeding value estimation.";
        fr = "Conduite de la s\u{00e9}lection assist\u{00e9}e par marqueurs, cartographie QTL et s\u{00e9}lection g\u{00e9}nomique pour la r\u{00e9}sistance au mildiou et aux virus chez la pomme de terre. D\u{00e9}veloppement de panels de marqueurs mol\u{00e9}culaires KASP et contribution \u{00e0} l'analyse des essais multi-environnements.";
        es = "Selecci\u{00f3}n asistida por marcadores, mapeo de QTL y selecci\u{00f3}n gen\u{00f3}mica para resistencia al tiz\u{00f3}n tard\u{00ed}o y virus en papa. Desarrollo de paneles de marcadores moleculares KASP y contribuci\u{00f3}n al an\u{00e1}lisis de ensayos multi-ambiente.";
      };
      tags = ["marker-assisted selection", "QTL mapping", "genomic selection", "KASP markers", "potato"];
      displayOrder = 2;
    };

    let experience3 : Experience = {
      id = 3;
      title = {
        en = "Graduate Research Scientist";
        fr = "Scientifique Chercheur Doctoral";
        es = "Cient\u{00ed}fico Investigador de Posgrado";
      };
      organization = "University of Hohenheim";
      location = "Stuttgart, Germany";
      startDate = "2015-10-01";
      endDate = ?"2019-09-01";
      description = {
        en = "Ph.D. research on sorghum hybrid breeding — QTL mapping for fertility restoration, hybrid performance analysis under variable moisture environments in West Africa. Collaborated with ICRISAT and INERA on multi-environment field trials.";
        fr = "Recherche doctorale sur la s\u{00e9}lection d'hybrides de sorgho — cartographie QTL pour la restauration de la fertilit\u{00e9}, analyse de la performance hybride dans des environnements \u{00e0} humidit\u{00e9} variable en Afrique de l'Ouest. Collaboration avec l'ICRISAT et l'INERA sur des essais multi-environnements.";
        es = "Investigaci\u{00f3}n doctoral sobre mejoramiento de h\u{00ed}bridos de sorgo — mapeo de QTL para restauraci\u{00f3}n de fertilidad, an\u{00e1}lisis de desempe\u{00f1}o h\u{00ed}brido en ambientes de humedad variable en \u{00c1}frica Occidental. Colaboraci\u{00f3}n con ICRISAT e INERA en ensayos multi-ambiente.";
      };
      tags = ["sorghum", "QTL mapping", "hybrid breeding", "fertility restoration", "West Africa"];
      displayOrder = 3;
    };

    let experience4 : Experience = {
      id = 4;
      title = {
        en = "Internship / Visiting Researcher";
        fr = "Stage / Chercheur Invit\u{00e9}";
        es = "Pasant\u{00ed}a / Investigador Visitante";
      };
      organization = "ICRISAT (International Crops Research Institute for the Semi-Arid Tropics)";
      location = "Bamako, Mali";
      startDate = "2014-01-01";
      endDate = ?"2015-09-01";
      description = {
        en = "Evaluation of sorghum hybrids under low-input and diverse environmental conditions in West Africa. Supported multi-location trials and data analysis as part of sorghum hybrid development for smallholder farmers.";
        fr = "Evaluation d'hybrides de sorgho dans des conditions de faibles intrants et des environnements vari\u{00e9}s en Afrique de l'Ouest. Appui aux essais multi-sites et \u{00e0} l'analyse des donn\u{00e9}es dans le cadre du d\u{00e9}veloppement d'hybrides de sorgho pour les petits agriculteurs.";
        es = "Evaluaci\u{00f3}n de h\u{00ed}bridos de sorgo bajo condiciones de bajos insumos y entornos diversos en \u{00c1}frica Occidental. Apoyo a ensayos multi-localidad y an\u{00e1}lisis de datos para el desarrollo de h\u{00ed}bridos de sorgo para peque\u{00f1}os agricultores.";
      };
      tags = ["sorghum", "ICRISAT", "hybrid evaluation", "West Africa", "low-input"];
      displayOrder = 4;
    };

    let experience5 : Experience = {
      id = 5;
      title = {
        en = "Research Intern";
        fr = "Stagiaire de Recherche";
        es = "Pasante de Investigaci\u{00f3}n";
      };
      organization = "ICRISAT (International Crops Research Institute for the Semi-Arid Tropics)";
      location = "Bamako, Mali";
      startDate = "2013-01-01";
      endDate = ?"2013-12-01";
      description = {
        en = "Field evaluation of sorghum genotypes for adaptive traits. Contributed to data collection, phenotyping, and crop management activities under the sorghum breeding program in Mali.";
        fr = "Evaluation en champ de g\u{00e9}notypes de sorgho pour des caract\u{00e8}res d'adaptation. Contribution \u{00e0} la collecte de donn\u{00e9}es, au ph\u{00e9}notypage et aux activit\u{00e9}s de gestion des cultures dans le cadre du programme de s\u{00e9}lection du sorgho au Mali.";
        es = "Evaluaci\u{00f3}n de campo de genotipos de sorgo para caracteres adaptativos. Contribuci\u{00f3}n a la recopilaci\u{00f3}n de datos, fenotipado y actividades de manejo de cultivos bajo el programa de mejoramiento de sorgo en Mali.";
      };
      tags = ["sorghum", "ICRISAT", "field evaluation", "phenotyping"];
      displayOrder = 5;
    };

    experiencesMap.add(1, experience1);
    experiencesMap.add(2, experience2);
    experiencesMap.add(3, experience3);
    experiencesMap.add(4, experience4);
    experiencesMap.add(5, experience5);
    nextExperienceId := 6;

    // Education
    let education1 : Education = {
      id = 1;
      degree = {
        en = "Doctor of Philosophy (Ph.D.)";
        fr = "Doctorat (Ph.D.)";
        es = "Doctorado (Ph.D.)";
      };
      institution = "University of Hohenheim";
      location = "Stuttgart, Germany";
      field = {
        en = "Plant Breeding / Agricultural Sciences";
        fr = "Am\u{00e9}lioration des Plantes / Sciences Agricoles";
        es = "Mejoramiento de Plantas / Ciencias Agr\u{00ed}colas";
      };
      startYear = 2015;
      endYear = 2019;
      thesisHost = null;
      notes = {
        en = "Thesis on QTL mapping for fertility restoration and hybrid performance in sorghum. Research conducted in partnership with ICRISAT and national programs in Burkina Faso and Mali.";
        fr = "Th\u{00e8}se sur la cartographie QTL pour la restauration de la fertilit\u{00e9} et la performance hybride chez le sorgho. Recherche conduite en partenariat avec l'ICRISAT et des programmes nationaux au Burkina Faso et au Mali.";
        es = "Tesis sobre mapeo de QTL para restauraci\u{00f3}n de fertilidad y desempe\u{00f1}o h\u{00ed}brido en sorgo. Investigaci\u{00f3}n realizada en asociaci\u{00f3}n con el ICRISAT y programas nacionales en Burkina Faso y Mali.";
      };
      displayOrder = 1;
    };

    let education2 : Education = {
      id = 2;
      degree = {
        en = "Master of Science (M.Sc.)";
        fr = "Master of Science (M.Sc.)";
        es = "Maestr\u{00ed}a en Ciencias (M.Sc.)";
      };
      institution = "University of G\u{00f6}ttingen";
      location = "G\u{00f6}ttingen, Germany";
      field = {
        en = "Tropical and International Agriculture (Agronomy)";
        fr = "Agriculture Tropicale et Internationale (Agronomie)";
        es = "Agricultura Tropical e Internacional (Agronom\u{00ed}a)";
      };
      startYear = 2013;
      endYear = 2015;
      thesisHost = null;
      notes = {
        en = "Specialized training in tropical crop production, plant breeding, quantitative genetics, and international agricultural development.";
        fr = "Formation sp\u{00e9}cialis\u{00e9}e en production de cultures tropicales, s\u{00e9}lection v\u{00e9}g\u{00e9}tale, g\u{00e9}n\u{00e9}tique quantitative et d\u{00e9}veloppement agricole international.";
        es = "Formaci\u{00f3}n especializada en producci\u{00f3}n de cultivos tropicales, mejoramiento vegetal, gen\u{00e9}tica cuantitativa y desarrollo agr\u{00ed}cola internacional.";
      };
      displayOrder = 2;
    };

    let education3 : Education = {
      id = 3;
      degree = {
        en = "Bachelor of Science (B.Sc.) in Agronomy";
        fr = "Licence en Agronomie (B.Sc.)";
        es = "Licenciatura en Agronom\u{00ed}a (B.Sc.)";
      };
      institution = "\u{00c9}cole Nationale Sup\u{00e9}rieure d'Agriculture (ENSA)";
      location = "Thi\u{00e8}s, Senegal";
      field = {
        en = "Agronomy";
        fr = "Agronomie";
        es = "Agronom\u{00ed}a";
      };
      startYear = 2008;
      endYear = 2013;
      thesisHost = null;
      notes = {
        en = "Foundational training in crop science, soil science, agricultural systems, and field experimentation. Includes one year of professional internship.";
        fr = "Formation de base en sciences des cultures, p\u{00e9}dologie, syst\u{00e8}mes agricoles et exp\u{00e9}rimentation en champ. Comprend une ann\u{00e9}e de stage professionnel.";
        es = "Formaci\u{00f3}n b\u{00e1}sica en ciencias de cultivos, ciencias del suelo, sistemas agr\u{00ed}colas y experimentaci\u{00f3}n de campo. Incluye un a\u{00f1}o de pr\u{00e1}cticas profesionales.";
      };
      displayOrder = 3;
    };

    educationMap.add(1, education1);
    educationMap.add(2, education2);
    educationMap.add(3, education3);
    nextEducationId := 4;

    // Publications — all from ORCID, newest to oldest (displayOrder 1 = newest)
    // featured=true: Kante in first 3 authors
    // featured=false: Kante not in first 3 authors

    // 1. 2025 — Frontiers in Plant Science (Garcia-Oliveira et al., Kante is 7th) — NOT featured
    let publication1 : Publication = {
      id = 1;
      title = "The importance of genotyping within the climate-smart plant breeding value chain \u{2013} integrative tools for genetic enhancement programs";
      authors = "Garcia-Oliveira AL, Ortiz R, Sarsu F, Rasmussen SK, Agre P, Asfaw A, Kante M, Chander S";
      venue = "Frontiers in Plant Science, Vol 15";
      year = 2025;
      doi = "10.3389/fpls.2024.1518123";
      url = "https://doi.org/10.3389/fpls.2024.1518123";
      isPreprint = false;
      featured = false;
      displayOrder = 1;
    };

    // 2. 2024 — Book chapter (Forward Breeding, Bohar R, Dreisigacker S, Lindqvist-Kreuze H, Kante M 4th) — NOT featured
    let publication2 : Publication = {
      id = 2;
      title = "Forward breeding for efficient selection";
      authors = "Bohar R, Dreisigacker S, Lindqvist-Kreuze H, Kante M, Pandey MK, Sharma V, Chaudhari S, Varshney RK";
      venue = "Frontier Technologies for Crop Improvement (Sustainability Sciences in Asia and Africa), pp. 153\u{2013}185";
      year = 2024;
      doi = "10.1007/978-981-99-4673-0_8";
      url = "https://doi.org/10.1007/978-981-99-4673-0_8";
      isPreprint = false;
      featured = false;
      displayOrder = 2;
    };

    // 3. 2024 — The Plant Genome (Endelman, Kante 2nd) — featured
    let publication3 : Publication = {
      id = 3;
      title = "Targeted genotyping-by-sequencing of potato and data analysis with R/polyBreedR";
      authors = "Endelman JB, Kante M, Lindqvist-Kreuze H, Kilian A, Shannon LM, Caraza-Harter MV, Vaillancourt B, Mailloux K, Hamilton JP, Buell CR";
      venue = "The Plant Genome, Vol 17, Issue 3, e20484";
      year = 2024;
      doi = "10.1002/tpg2.20484";
      url = "https://doi.org/10.1002/tpg2.20484";
      isPreprint = false;
      featured = true;
      displayOrder = 3;
    };

    // 4. 2023 — Plant Disease (David M, Kante M 2nd) — NOT featured
    let publication4 : Publication = {
      id = 4;
      title = "Early-stage phenotyping of sweet potato virus disease caused by sweet potato chlorotic stunt virus and sweet potato virus C to support breeding";
      authors = "David M, Kante M, Fuentes S, Eyzaguirre R, Diaz F, De Boeck B, Mwanga ROM, Kreuze J, Gr\u{00fc}neberg WJ";
      venue = "Plant Disease, Vol 107, No 7, pp. 2061\u{2013}2069";
      year = 2023;
      doi = "10.1094/PDIS-08-21-1650-RE";
      url = "https://doi.org/10.1094/PDIS-08-21-1650-RE";
      isPreprint = false;
      featured = false;
      displayOrder = 4;
    };

    // 5. 2022 — Plants (Santayana, Aponte, Kante 3rd) — NOT featured
    let publication5 : Publication = {
      id = 5;
      title = "Cytoplasmic Male Sterility Incidence in Potato Breeding Populations with Late Blight Resistance and Identification of Breeding Lines with a Potential Fertility Restorer Mechanism";
      authors = "Santayana M, Aponte M, Kante M, Eyzaguirre R, Gastelo M, Lindqvist-Kreuze H";
      venue = "Plants, 11(22), 3093";
      year = 2022;
      doi = "10.3390/plants11223093";
      url = "https://doi.org/10.3390/plants11223093";
      isPreprint = false;
      featured = false;
      displayOrder = 5;
    };

    // 6. 2021 — Agronomy (Kante 1st) — NOT featured (KASP paper, dropped from featured per user)
    let publication6 : Publication = {
      id = 6;
      title = "Kompetitive Allele Specific PCR (KASP) Markers for Potato: An Effective Tool for Increased Genetic Gains";
      authors = "Kante M, Lindqvist-Kreuze H, Portal L, David M, Gastelo M";
      venue = "Agronomy, 11(11), 2315";
      year = 2021;
      doi = "10.3390/agronomy11112315";
      url = "https://doi.org/10.3390/agronomy11112315";
      isPreprint = false;
      featured = false;
      displayOrder = 6;
    };

    // 7. 2019 — Crop Science (Kante 1st) — featured
    let publication7 : Publication = {
      id = 7;
      title = "Sorghum Hybrids for Low-Input Farming Systems in West Africa: Quantitative Genetic Parameters to Guide Hybrid Breeding";
      authors = "Kante M, Rattunde F, N\u{00e9}bi\u{00e9} B, Sissoko I, Diallo B, Diallo A, Tour\u{00e9} A, Weltzien E, Haussmann BIG, Leiser WL";
      venue = "Crop Science, 59(6): 2544\u{2013}2561";
      year = 2019;
      doi = "10.2135/cropsci2019.03.0172";
      url = "https://doi.org/10.2135/cropsci2019.03.0172";
      isPreprint = false;
      featured = true;
      displayOrder = 7;
    };

    // 8. 2018 — TAG (Kante 1st) — featured (RF marker paper)
    let publication8 : Publication = {
      id = 8;
      title = "QTL mapping and validation of fertility restoration in West African sorghum A1 cytoplasm and identification of a potential causative mutation for Rf2";
      authors = "Kante M, Rattunde HFW, N\u{00e9}bi\u{00e9} B, Weltzien E, Haussmann BIG, Leiser WL";
      venue = "Theoretical and Applied Genetics, 131: 2397\u{2013}2412";
      year = 2018;
      doi = "10.1007/s00122-018-3161-z";
      url = "https://doi.org/10.1007/s00122-018-3161-z";
      isPreprint = false;
      featured = true;
      displayOrder = 8;
    };

    // 9. 2017 — Crop Science (Kante 1st) — NOT featured
    let publication9 : Publication = {
      id = 9;
      title = "Can Tall Guinea-Race Sorghum Hybrids Deliver Yield Advantage to Smallholder Farmers in West and Central Africa?";
      authors = "Kante M, Rattunde HFW, Leiser WL, N\u{00e9}bi\u{00e9} B, Diallo B, Diallo A, Tour\u{00e9} A, Weltzien E, Haussmann BIG";
      venue = "Crop Science, 57(2): 833\u{2013}842";
      year = 2017;
      doi = "10.2135/cropsci2016.09.0765";
      url = "https://doi.org/10.2135/cropsci2016.09.0765";
      isPreprint = false;
      featured = false;
      displayOrder = 9;
    };

    // 10. 2016 — Euphytica (Kante 1st) — NOT featured
    let publication10 : Publication = {
      id = 10;
      title = "Stay-green QTLs in temperate elite maize";
      authors = "Kante M, Revilla P, De La Fuente M, Caicedo M, Ord\u{00e1}s B";
      venue = "Euphytica, 207(2): 463\u{2013}473";
      year = 2016;
      doi = "10.1007/s10681-015-1575-0";
      url = "https://doi.org/10.1007/s10681-015-1575-0";
      isPreprint = false;
      featured = false;
      displayOrder = 10;
    };

    // 11. 2026 — bioRxiv preprint (late blight, submitted to PLoS ONE)
    let publication11 : Publication = {
      id = 11;
      title = "Prediction of late blight severity in a large panel of potato genotypes using low-altitude aerial images and machine learning methods";
      authors = "Loayza H, Ninanya J, Palacios S, Silva L, Pujaico Rivera F, Rinza J, Gastelo M, Aponte M, Kreuze JF, Lindqvist-Kreuze H, Heider B, Kante M, Ram\u{00ed}rez DA";
      venue = "bioRxiv (submitted to PLoS ONE)";
      year = 2026;
      doi = "10.64898/2026.04.06.716456";
      url = "https://doi.org/10.64898/2026.04.06.716456";
      isPreprint = true;
      featured = false;
      displayOrder = 0;
    };

    // 12. 2025 — Manuscript submitted to TAG (microhaplotypes, no preprint link yet)
    let publication12 : Publication = {
      id = 12;
      title = "Development and Characterization of Microhaplotype Databases for Diverse Crop Species";
      authors = "Kante M et al.";
      venue = "Submitted to Theoretical and Applied Genetics (TAG)";
      year = 2025;
      doi = "";
      url = "";
      isPreprint = true;
      featured = false;
      displayOrder = 1;
    };

    publicationsMap.add(1, publication1);
    publicationsMap.add(2, publication2);
    publicationsMap.add(3, publication3);
    publicationsMap.add(4, publication4);
    publicationsMap.add(5, publication5);
    publicationsMap.add(6, publication6);
    publicationsMap.add(7, publication7);
    publicationsMap.add(8, publication8);
    publicationsMap.add(9, publication9);
    publicationsMap.add(10, publication10);
    publicationsMap.add(11, publication11);
    publicationsMap.add(12, publication12);
    nextPublicationId := 13;

    // Languages
    let language1 : Language = {
      id = 1;
      name = {
        en = "Wolof";
        fr = "Wolof";
        es = "Wolof";
      };
      level = {
        en = "Native / Bilingual";
        fr = "Langue maternelle / Bilingue";
        es = "Nativo / Biling\u{00fc}e";
      };
      displayOrder = 1;
    };

    let language2 : Language = {
      id = 2;
      name = {
        en = "French";
        fr = "Fran\u{00e7}ais";
        es = "Franc\u{00e9}s";
      };
      level = {
        en = "Native / Bilingual";
        fr = "Langue maternelle / Bilingue";
        es = "Nativo / Biling\u{00fc}e";
      };
      displayOrder = 2;
    };

    let language3 : Language = {
      id = 3;
      name = {
        en = "English";
        fr = "Anglais";
        es = "Ingl\u{00e9}s";
      };
      level = {
        en = "Full professional proficiency";
        fr = "Comp\u{00e9}tence professionnelle compl\u{00e8}te";
        es = "Competencia profesional plena";
      };
      displayOrder = 3;
    };

    let language4 : Language = {
      id = 4;
      name = {
        en = "Spanish";
        fr = "Espagnol";
        es = "Espa\u{00f1}ol";
      };
      level = {
        en = "Full professional proficiency";
        fr = "Comp\u{00e9}tence professionnelle compl\u{00e8}te";
        es = "Competencia profesional plena";
      };
      displayOrder = 4;
    };

    let language5 : Language = {
      id = 5;
      name = {
        en = "German";
        fr = "Allemand";
        es = "Alem\u{00e1}n";
      };
      level = {
        en = "Elementary";
        fr = "\u{00c9}l\u{00e9}mentaire";
        es = "Elemental";
      };
      displayOrder = 5;
    };

    languagesMap.add(1, language1);
    languagesMap.add(2, language2);
    languagesMap.add(3, language3);
    languagesMap.add(4, language4);
    languagesMap.add(5, language5);
    nextLanguageId := 6;

    // Social Links — LinkedIn only, no GitHub placeholder
    let socialLink1 : SocialLink = {
      id = 1;
      platform = "LinkedIn";
      url = "https://www.linkedin.com/in/moctarkante";
      displayOrder = 1;
    };

    let socialLink2 : SocialLink = {
      id = 2;
      platform = "ORCID";
      url = "https://orcid.org/0000-0003-4669-3132";
      displayOrder = 2;
    };

    socialLinksMap.add(1, socialLink1);
    socialLinksMap.add(2, socialLink2);
    nextSocialLinkId := 3;

    // Ongoing Projects — start empty, no sample data needed
    nextProjectId := 1;

    // Relevant Links — seed one initial entry
    let relevantLink1 : RelevantLink = {
      id = 1;
      title = {
        en = "CIP \u{2013} International Potato Center";
        fr = "CIP \u{2013} Centre international de la pomme de terre";
        es = "CIP \u{2013} Centro Internacional de la Papa";
      };
      url = "https://cipotato.org/";
      description = ?{
        en = "The International Potato Center (CIP) is a research-for-development organization with a focus on potato, sweetpotato, and Andean roots and tubers.";
        fr = "Le Centre international de la pomme de terre (CIP) est une organisation de recherche pour le d\u{00e9}veloppement ax\u{00e9}e sur la pomme de terre, la patate douce et les racines et tubercules andins.";
        es = "El Centro Internacional de la Papa (CIP) es una organizaci\u{00f3}n de investigaci\u{00f3}n para el desarrollo enfocada en la papa, el camote y las ra\u{00ed}ces y tub\u{00e9}rculos andinos.";
      };
      displayOrder = 0;
      createdAt = 0;
      updatedAt = 0;
    };

    relevantLinksMap.add(1, relevantLink1);
    nextRelevantLinkId := 2;
  };

  public shared ({ caller }) func seedInitialData() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    doSeed();
  };

  // Only seed on fresh deployment (empty state). Prevents data wipe on canister upgrades.
  if (publicationsMap.size() == 0) { doSeed() };
};
