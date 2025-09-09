import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Container, getQueryClient, SpherePurple, PageContainer } from "@/shared";
import { getProjectsAction, ProjectsList, projectsApi, PageHeader } from "@/features/projects";


export default async function HomePage() {
  const queryClient = getQueryClient();

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: [projectsApi.baseKey],
			queryFn: getProjectsAction,
		}),
	]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <PageContainer>
				<SpherePurple />

      <Container>
         <div className="w-full pt-40 sm:pt-44 md:pt-48 lg:pt-52 2xl:pt-96">
           <PageHeader header="Projects" buttonText="Create project" />

           <div className="w-full relative flex-center pt-8 xl:pt-16 gap-y-6 md:gap-y-16 xl:gap-y-20 pb-20">
						<HydrationBoundary state={dehydratedState}>
             	<ProjectsList />
     		  	</HydrationBoundary>
           </div>
         </div>
      </Container>
    </PageContainer>
  );
}
