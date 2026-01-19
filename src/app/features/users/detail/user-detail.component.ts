import { Component, inject, computed, signal, OnInit, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTreeModule, MatTree } from '@angular/material/tree';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { rxResource, toSignal, toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services & Models
import { UserService } from 'src/app/core/services/users/user.service';
import { UserNetworkDetail, UserNode } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserRankEnum, UserRankLabel } from 'src/app/core/models/users/user.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTreeModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: 'user-detail.component.html',
  styleUrl: 'user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly loggerService = inject(LoggerService);
  private readonly CLASS_NAME = UserDetailComponent.name;

  @ViewChild(MatTree) treeOutlet!: MatTree<UserNode>;

  // Reactively track the user ID from the route
  userId = toSignal(
    this.route.params.pipe(map(params => params['id'] ? +params['id'] : null))
  );

  private userId$ = toObservable(this.userId);

  // Resource to fetch user network and details. 
  userNetworkResource = rxResource({
    stream: () => this.userId$.pipe(
      switchMap(id => {
        this.loggerService.debug(`Resource fetching data for user ID: ${id}`, this.CLASS_NAME, 'stream');
        return id ? this.userService.getUserDetailWithNetwork(id) : of([] as UserNetworkDetail[]);
      })
    )
  });

  // Modern Tree: Accessor for children
  childrenAccessor = (node: UserNode) => node.children ?? [];

  // Tree data source as a simple array
  dataSource = signal<UserNode[]>([]);

  // Derived user basic info (the one being viewed is the one with relativeLevel 0)
  user = computed(() => {
    const network = (this.userNetworkResource.value() ?? []) as UserNetworkDetail[];
    return network.find(n => n.relativeLevel === 0);
  });

  constructor() {
    // Update tree when data arrives
    effect(() => {
      const context = `effect`;
      const data = (this.userNetworkResource.value() ?? []) as UserNetworkDetail[];
      const isLoading = this.userNetworkResource.isLoading();
      
      if (isLoading) {
        this.dataSource.set([]);
        return;
      }

      if (data.length > 0) {
        this.loggerService.debug(`Building tree for user detail: ${this.userId()}`,this.CLASS_NAME,context);
        const tree = this.buildTree(data);
        this.dataSource.set(tree);
        
        // Expand the root by default after a short delay for the view to initialize
        if (tree.length > 0) {
            setTimeout(() => {
                if (this.treeOutlet) {
                    this.treeOutlet.expand(tree[0]);
                }
            }, 100);
        }
      } else {
        this.dataSource.set([]);
      }
    });
  }

  hasChild = (_: number, node: UserNode) => !!node.children && node.children.length > 0;

  ngOnInit() {
    // No longer need manual subscription as we use toSignal for userId
  }

  private buildTree(flatList: UserNetworkDetail[]): UserNode[] {
    const context = `buildTree`;
    this.loggerService.debug(`Building tree for user detail: ${this.userId()} with data: ${JSON.stringify(flatList)}`,this.CLASS_NAME,context);
    const map: { [key: number]: UserNode } = {};
    const roots: UserNode[] = [];

    // First pass: Create all nodes
    flatList.forEach(item => {
      map[item.id] = { ...item, children: [] };
    });

    // Second pass: Connect children to parents
    flatList.forEach(item => {
      const node = map[item.id];
      if (item.relativeLevel === 0) {
        roots.push(node);
      } else if (item.sponsorId && map[item.sponsorId]) {
        map[item.sponsorId].children!.push(node);
      }
    });
    this.loggerService.debug(`Built tree for user detail: ${this.userId()} with roots: ${JSON.stringify(roots)}`,this.CLASS_NAME,context);
    return roots;
  }

  goBack() {
    this.router.navigate(['/users']);
  }

  viewUser(id: number) {
    this.router.navigate(['/users', id]);
  }

  getRankLabel(rank: UserRankEnum): string {
    return UserRankLabel[rank] || rank;
  }
}
